import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config();

const authMiddleware = async (req, res, next) => {
    const auth = req.headers['authorization'];

    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized!' });

    const token = auth.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        if (decoded.role === 'client') {
            return res.status(403).json({ message: 'Forbidden: Freelancer access only!' });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token!' });
    }
}

export default authMiddleware;