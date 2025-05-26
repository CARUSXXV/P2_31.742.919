import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Middleware robusto para proteger rutas admin
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies.adminToken;
    if (!token) {
        return res.redirect('/admin/login');
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET || 'secret');
        next();
    } catch (error) {
        res.clearCookie('adminToken');
        res.redirect('/admin/login');
    }
};