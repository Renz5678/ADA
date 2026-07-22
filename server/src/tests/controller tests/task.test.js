import request from 'supertest';
import app from '../../../app.js';
import { sequelize, models } from '../../models/index.js';
import jwt from 'jsonwebtoken';

const { Users, Tasks } = models;

let token;
let userId;

beforeAll(async () => {
    await sequelize.sync();
    await Users.destroy({ where: { email: 'tasktest@email.com' } });
    const user = await Users.create({
        username: 'TaskTestUser',
        business_name: 'Task Business',
        email: 'tasktest@email.com',
        password: 'TestPass1!',
        is_verified: true
    });
    userId = user.user_id;

    token = jwt.sign({ id: user.user_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

describe('Integration Test: Tasks', () => {
    let taskId;

    it('should create a new task', async () => {
        const response = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Test Generic Task',
                deadline: new Date().toISOString()
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Task created');
        expect(response.body.task.title).toBe('Test Generic Task');
        expect(response.body.task.priority_score).toBeDefined();
        taskId = response.body.task.task_id;
    });

    it('should get tasks for user', async () => {
        const response = await request(app)
            .get('/tasks')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].task_id).toBe(taskId);
    });

    it('should update a task', async () => {
        const response = await request(app)
            .put(`/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                status: 'Done'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Task updated');
        expect(response.body.task.status).toBe('Done');
    });

    it('should delete a task', async () => {
        const response = await request(app)
            .delete(`/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Task deleted');
    });
});

afterAll(async () => {
    await Tasks.destroy({ where: { user_id: userId } });
    await Users.destroy({ where: { user_id: userId } });
});
