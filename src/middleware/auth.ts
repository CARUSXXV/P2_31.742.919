import { Request, Response, NextFunction } from 'express';

// Middleware robusto para proteger rutas admin
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    res.redirect('/admin/login');
};