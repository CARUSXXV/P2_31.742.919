import { DatabaseConnection } from './Database';
import bcrypt from 'bcrypt';

export interface Admin {
    id?: number;
    email: string;
    password: string;
    created_at?: string;
}

export class AdminModel {
    private db = DatabaseConnection.getInstance().getDatabase();

    public async validateCredentials(email: string, password: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM admins WHERE email = ?',
                [email],
                async (err, admin: Admin) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (!admin) {
                        resolve(false);
                        return;
                    }
                    const match = await bcrypt.compare(password, admin.password);
                    resolve(match);
                }
            );
        });
    }

    public async createAdmin(admin: Admin): Promise<number> {
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO admins (email, password) VALUES (?, ?)',
                [admin.email, hashedPassword],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    public async getStats(): Promise<any> {
        // Consultas SQL para obtener estadísticas reales
        const stats: any = {
            totalContacts: 0,
            totalPayments: 0,
            totalRevenue: 0,
            successRate: 0,
            paymentStatus: {},
            currencyDistribution: {},
            contactsByCountry: {},
            popularServices: {}
        };
        const db = this.db;
        // Promisify all queries
        const query = (sql: string, params: any[] = []) => new Promise<any[]>((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err); else resolve(rows);
            });
        });
        // Total de contactos
        const contacts = await query('SELECT COUNT(*) as total FROM contacts');
        stats.totalContacts = contacts[0]?.total || 0;
        // Total de pagos
        const payments = await query('SELECT COUNT(*) as total FROM payments');
        stats.totalPayments = payments[0]?.total || 0;
        // Ingresos totales (solo pagos exitosos conocidos)
        const estadosExito = [
            'Payment successful',
            'Payment processed successfully',
            'success',
            'aprobado',
            'exitoso'
        ];
        const placeholders = estadosExito.map(() => '?').join(',');
        const revenue = await query(`SELECT SUM(amount) as total FROM payments WHERE status IN (${placeholders})`, estadosExito);
        stats.totalRevenue = revenue[0]?.total ? parseFloat(revenue[0].total).toFixed(2) : 0;
        // Tasa de éxito (considera todos los estados exitosos conocidos)
        const pagosExitosos = await query(`SELECT COUNT(*) as total FROM payments WHERE status IN (${placeholders})`, estadosExito);
        stats.successRate = stats.totalPayments > 0 ? Math.round((pagosExitosos[0].total / stats.totalPayments) * 100) : 0;
        // Estado de pagos (muestra cada estado real tal como está en la base de datos)
        const estados = await query('SELECT status, COUNT(*) as total FROM payments GROUP BY status');
        estados.forEach(e => {
            // Capitaliza la primera letra, pero muestra el estado real
            let label = (e.status && e.status.trim()) ? e.status.charAt(0).toUpperCase() + e.status.slice(1) : 'Desconocido';
            stats.paymentStatus[label] = (stats.paymentStatus[label] || 0) + e.total;
        });
        // Elimina categorías con valor 0 para que solo se muestren las presentes
        Object.keys(stats.paymentStatus).forEach(cat => {
            if (stats.paymentStatus[cat] === 0) delete stats.paymentStatus[cat];
        });
        // Distribución por moneda
        const monedas = await query('SELECT currency, COUNT(*) as total FROM payments GROUP BY currency');
        monedas.forEach(m => { stats.currencyDistribution[m.currency] = m.total; });
        // Contactos por país (mejorar visualización de nulos)
        const paises = await query('SELECT country, COUNT(*) as total FROM contacts GROUP BY country');
        paises.forEach(p => {
            let label = p.country || 'Desconocido';
            if (label.toLowerCase() === 'unknown') label = 'Desconocido';
            stats.contactsByCountry[label] = p.total;
        });
        // Servicios más solicitados
        const servicios = await query('SELECT service_id, COUNT(*) as total FROM payments GROUP BY service_id');
        servicios.forEach(s => { stats.popularServices['Servicio ' + s.service_id] = s.total; });
        // Pagos exitosos y rechazados
        const pagosExitososCount = await query(`SELECT COUNT(*) as total FROM payments WHERE status IN (${placeholders})`, estadosExito);
        stats.successfulPayments = pagosExitososCount[0]?.total || 0;
        const pagosRechazadosCount = await query(`SELECT COUNT(*) as total FROM payments WHERE status NOT IN (${placeholders})`, estadosExito);
        stats.rejectedPayments = pagosRechazadosCount[0]?.total || 0;
        return stats;
    }

    public async changePassword(email: string, oldPassword: string, newPassword: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM admins WHERE email = ?',
                [email],
                async (err, admin: Admin) => {
                    if (err) return reject(err);
                    if (!admin) return resolve(false);
                    const match = await bcrypt.compare(oldPassword, admin.password);
                    if (!match) return resolve(false);
                    const hashed = await bcrypt.hash(newPassword, 10);
                    this.db.run(
                        'UPDATE admins SET password = ? WHERE email = ?',
                        [hashed, email],
                        function (err) {
                            if (err) reject(err);
                            else resolve(true);
                        }
                    );
                }
            );
        });
    }
}