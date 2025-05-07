import { DatabaseConnection } from './Database';

// Interfaz que define la estructura del pago
export interface Payment {
  id?: number; // ID del pago
  email: string; // Correo electrónico de la persona que realiza el pago
  cardholder_name: string; // Nombre del titular de la tarjeta
  card_number: string; // Número de la tarjeta de crédito
  expiry_month: string; // Mes de expiración de la tarjeta
  expiry_year: string; // Año de expiración de la tarjeta
  cvv: string; // Código de seguridad de la tarjeta
  amount: number; // Monto del pago
  currency: string; // Moneda del pago
  service_id: number; // ID del servicio asociado al pago
  created_at?: string; // Fecha de creación del pago
}


// Clase para manejar operaciones relacionadas con los pagos
export class PaymentModel {
  private db = DatabaseConnection.getInstance().getDatabase();

  // Método para agregar un nuevo pago a la base de datos
  public async add(payment: Payment): Promise<number> {
    return new Promise((resolve, reject) => {
      const { email, cardholder_name, card_number, expiry_month, expiry_year, cvv, amount, currency, service_id } = payment;
      // Registro de información sobre el pago que se va a insertar
      console.log('Inserting payment with data:', { email, cardholder_name, amount, currency, service_id });

      this.db.run(
        'INSERT INTO payments (email, cardholder_name, card_number, expiry_month, expiry_year, cvv, amount, currency, service_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [email, cardholder_name, card_number, expiry_month, expiry_year, cvv, amount, currency, service_id],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            reject(err);
          } else {
            console.log('Payment inserted successfully, ID:', this.lastID);
            resolve(this.lastID);
          }
        }
      );
    });
  }

  public async getAll(): Promise<Payment[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM payments ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Payment[]);
        }
      });
    });
  }
}