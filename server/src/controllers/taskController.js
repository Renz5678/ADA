import { models } from '../models/index.js';
import { validationResult } from 'express-validator';
import { calculatePriorityScore } from '../utils/priorityEngine.js';

const { Tasks, Orders } = models;

const TaskController = {
    async getTasks(req, res) {
        try {
            const user_id = req.user.id;
            const tasks = await Tasks.findAll({
                where: { user_id },
                include: [{ model: Orders, attributes: ['total_amount'] }],
                order: [['priority_score', 'DESC'], ['deadline', 'ASC']]
            });
            res.json(tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            res.status(500).json({ message: 'Error fetching tasks' });
        }
    },

    async createTask(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

            const user_id = req.user.id;
            const { title, deadline, status, related_order_id } = req.body;

            const newTask = await Tasks.create({
                user_id,
                title,
                deadline,
                status: status || 'Not Started',
                related_order_id
            });

            // Calculate priority score if related to an order
            if (related_order_id) {
                const order = await Orders.findByPk(related_order_id);
                // The average order value can be fetched dynamically, using 0 for now as a fallback or passing proper context
                const score = calculatePriorityScore({ ...newTask.toJSON(), total_amount: order?.total_amount }, 100);
                newTask.priority_score = score;
                await newTask.save();
            }

            res.status(201).json({ message: 'Task created', task: newTask });
        } catch (error) {
            console.error('Error creating task:', error);
            res.status(500).json({ message: 'Error creating task' });
        }
    },

    async updateTask(req, res) {
        try {
            const { id } = req.params;
            const user_id = req.user.id;
            const updates = req.body;

            const task = await Tasks.findOne({ where: { task_id: id, user_id } });
            if (!task) return res.status(404).json({ message: 'Task not found' });

            await task.update(updates);

            res.json({ message: 'Task updated', task });
        } catch (error) {
            console.error('Error updating task:', error);
            res.status(500).json({ message: 'Error updating task' });
        }
    },

    async deleteTask(req, res) {
        try {
            const { id } = req.params;
            const user_id = req.user.id;
            
            const task = await Tasks.findOne({ where: { task_id: id, user_id } });
            if (!task) return res.status(404).json({ message: 'Task not found' });

            await task.destroy();

            res.json({ message: 'Task deleted' });
        } catch (error) {
            console.error('Error deleting task:', error);
            res.status(500).json({ message: 'Error deleting task' });
        }
    }
};

export default TaskController;
