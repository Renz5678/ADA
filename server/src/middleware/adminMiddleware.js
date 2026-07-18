export const isAdmin = (req, res, next) => {
    // Assuming auth middleware sets req.user which includes role
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};
