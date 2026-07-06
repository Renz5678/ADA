import { models } from "../models/index.js";
import { validationResult } from "express-validator";

const { WeeklyAvailability } = models;

const getAvailabilities = async (req, res) => {
    try {
        const userId = req.user.id;
        const availabilities = await WeeklyAvailability.findAll({
            where: { user_id: userId },
            order: [['day_of_week', 'ASC']]
        });
        return res.status(200).json(availabilities);
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const createAvailability = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const userId = req.user.id;
        const { day_of_week, start_time, end_time } = req.body;

        const newAvailability = await WeeklyAvailability.create({
            user_id: userId,
            day_of_week,
            start_time,
            end_time
        });

        return res.status(201).json({ message: 'Availability created!', data: newAvailability });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const updateAvailability = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const userId = req.user.id;
        const availabilityId = req.params.id;
        const { day_of_week, start_time, end_time } = req.body;

        const availability = await WeeklyAvailability.findOne({
            where: { user_id: userId, availability_id: availabilityId }
        });

        if (!availability) return res.status(404).json({ message: 'Availability not found!' });

        const updates = {};
        if (day_of_week !== undefined) updates.day_of_week = day_of_week;
        if (start_time !== undefined) updates.start_time = start_time;
        if (end_time !== undefined) updates.end_time = end_time;

        await availability.update(updates);

        return res.status(200).json({ message: 'Availability updated successfully!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

const deleteAvailability = async (req, res) => {
    try {
        const userId = req.user.id;
        const availabilityId = req.params.id;

        const availability = await WeeklyAvailability.findOne({
            where: { user_id: userId, availability_id: availabilityId }
        });

        if (!availability) return res.status(404).json({ message: 'Availability not found!' });

        await availability.destroy();

        return res.status(200).json({ message: 'Availability deleted successfully!' });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export { getAvailabilities, createAvailability, updateAvailability, deleteAvailability };
