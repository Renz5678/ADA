import request from 'supertest';
import app from '../../../app.js';
import { sequelize, models } from '../../models/index.js';

const { Users, Tasks } = models;


// --- Auto-injected Agent Wrapper ---
const _testAgent = request.agent(app);
const agent = {
    get: (url) => _testAgent.get(url).set('X-Requested-With', 'XMLHttpRequest'),
    post: (url) => _testAgent.post(url).set('X-Requested-With', 'XMLHttpRequest'),
    put: (url) => _testAgent.put(url).set('X-Requested-With', 'XMLHttpRequest'),
    delete: (url) => _testAgent.delete(url).set('X-Requested-With', 'XMLHttpRequest'),
    patch: (url) => _testAgent.patch(url).set('X-Requested-With', 'XMLHttpRequest'),
};
// -----------------------------------


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

    await agent.post('/auth/login').send({
        email: 'tasktest@email.com',
        password: 'TestPass1!'
    });
});

describe('Integration Test: Tasks', () => {
    let taskId;

    it('should create a new task', async () => {
        const response = await agent
            .post('/tasks')
            
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
        const response = await agent
            .get('/tasks')
            ;

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].task_id).toBe(taskId);
    });

    it('should update a task', async () => {
        const response = await agent
            .put(`/tasks/${taskId}`)
            
            .send({
                status: 'Done'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Task updated');
        expect(response.body.task.status).toBe('Done');
    });

    it('should delete a task', async () => {
        const response = await agent
            .delete(`/tasks/${taskId}`)
            ;

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Task deleted');
    });
});

afterAll(async () => {
    await Tasks.destroy({ where: { user_id: userId } });
    await Users.destroy({ where: { user_id: userId } });
});
