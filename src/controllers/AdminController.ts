import { Request, Response } from 'express';
import { AdminModel } from '../models/AdminModel';

export class AdminController {
    private adminModel = new AdminModel();

    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const isValid = await this.adminModel.validateCredentials(email, password);

            if (!isValid) {
                res.render('admin/login', { error: 'Credenciales inválidas' });
                return;
            }

            req.session.isAdmin = true;
            req.session.userId = email;
            res.redirect('/admin/dashboard');
        } catch (error) {
            console.error('Error en login:', error);
            res.render('admin/login', { error: 'Error al iniciar sesión' });
        }
    }

    public async dashboard(req: Request, res: Response): Promise<void> {
        try {
            const stats = await this.adminModel.getStats();
            res.render('admin/dashboard', {
                stats,
                charts: {
                    paymentStatus: stats.paymentStatus,
                    currencyDistribution: stats.currencyDistribution,
                    contactsByCountry: stats.contactsByCountry,
                    popularServices: stats.popularServices
                }
            });
        } catch (error) {
            console.error('Error en dashboard:', error);
            res.status(500).send('Error al cargar el dashboard');
        }
    }

    public logout(req: Request, res: Response): void {
        req.session.destroy(() => {
            res.redirect('/admin/login');
        });
    }

    public async changePassword(req: Request, res: Response): Promise<void> {
        const email = typeof req.session.userId === 'string' ? req.session.userId : '';
        const { oldPassword, newPassword, confirmPassword } = req.body;
        if (req.method === 'GET') {
            return res.render('admin/change-password');
        }
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.render('admin/change-password', { error: 'Todos los campos son obligatorios.' });
        }
        if (newPassword !== confirmPassword) {
            return res.render('admin/change-password', { error: 'Las contraseñas no coinciden.' });
        }
        if (newPassword.length < 6) {
            return res.render('admin/change-password', { error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        }
        try {
            const changed = await this.adminModel.changePassword(email, oldPassword, newPassword);
            if (changed) {
                res.render('admin/change-password', { success: 'Contraseña cambiada correctamente.' });
            } else {
                res.render('admin/change-password', { error: 'La contraseña actual es incorrecta.' });
            }
        } catch (err) {
            res.render('admin/change-password', { error: 'Error al cambiar la contraseña.' });
        }
    }
}