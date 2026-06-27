import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { models } from '../models/index.js';

const { Users } = models;

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userResult = await Users.findOne({
            where: { email }
        })

        if (userResult !== null) return res.status(409).json({ message: 'Email already in use!' });

        const newUser = await Users.create({
            username,
            email,
            password
        });

        return res.status(201).json({ message: 'New User Created Successfully!', user: newUser });
    }
    catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userResult = await Users.findOne({
            where: { email }
        });

        if (userResult === null) return res.status(401).json({ message: 'Invalid credentials!' });

        const isPasswordCorrect = await bcrypt.compare(password, userResult.password);

        if (!isPasswordCorrect) return res.status(401).json({ message: 'Invalid credentials!' });

        const token = jwt.sign(
            {
                id: userResult.user_id,
                email: userResult.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        )

        return res.status(200).json({ message: 'Login valid!', token: token });
    } catch (e) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

};

export { register, login };