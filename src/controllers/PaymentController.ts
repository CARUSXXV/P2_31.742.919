import { Request, Response } from 'express';
import { PaymentModel, Payment } from '../models/PaymentModel';
import { body, validationResult } from 'express-validator';

// Clase para manejar las operaciones del controlador de pagos
export class PaymentController {
  // Instancia del modelo de pagos
  private paymentModel = new PaymentModel();

  // Validaciones para los campos del formulario de pago
  public validations = [
    body('email').isEmail().withMessage('Email inválido'), // Valida que el email sea correcto
    body('cardholder_name').notEmpty().withMessage('El nombre del titular es requerido'), // Valida que el nombre no esté vacío
    body('card_number').matches(/^\d{16}$/).withMessage('Número de tarjeta inválido'), // Valida que el número de tarjeta tenga 16 dígitos
    body('expiry_month').isInt({ min: 1, max: 12 }).withMessage('Mes inválido'), // Valida que el mes esté entre 1 y 12
    body('expiry_year').isInt({ min: new Date().getFullYear() }).withMessage('Año inválido'), // Valida que el año sea el actual o mayor
    body('cvv').isLength({ min: 3, max: 4 }).withMessage('CVV inválido'), // Valida que el CVV tenga entre 3 y 4 caracteres
    body('amount').isFloat({ min: 0.01 }).withMessage('Monto inválido'), // Valida que el monto sea mayor a 0.01
    body('currency').isIn(['USD', 'EUR']).withMessage('Moneda inválida'), // Valida que la moneda sea USD o EUR
    body('service_id').isInt().withMessage('Servicio inválido') // Valida que el ID del servicio sea un entero
  ];

  // Método para agregar un nuevo pago
  public async add(req: Request, res: Response): Promise<void> {
    try {
      console.log('Received payment data:', req.body); // Registro de los datos recibidos

      const errors = validationResult(req); // Validación de los datos de entrada
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array()); // Registro de errores de validación
        res.render('payment', { // Renderiza la vista de pago con errores
          errors: errors.array(),
          companyInfo: req.app.locals.companyInfo // Información de la empresa
        });
        return;
      }

      // Crear un objeto de pago a partir del cuerpo de la solicitud
      const payment: Payment = {
        email: req.body.email,
        cardholder_name: req.body.cardholder_name,
        card_number: req.body.card_number,
        expiry_month: req.body.expiry_month,
        expiry_year: req.body.expiry_year,
        cvv: req.body.cvv,
        amount: parseFloat(req.body.amount),
        currency: req.body.currency,
        service_id: parseInt(req.body.service_id, 10)
      };

      console.log('Processing payment:', payment); // Registro del pago que se está procesando

      const paymentId = await this.paymentModel.add(payment); // Guarda el pago en la base de datos
      console.log('Payment saved with ID:', paymentId); // Registro del ID del pago guardado

      res.render('payment', { // Renderiza la vista de pago con éxito
        success: true,
        companyInfo: req.app.locals.companyInfo // Información de la empresa
      });
    } catch (error) {
      console.error('Error processing payment:', error); // Registro de error en el procesamiento del pago
      res.render('payment', { // Renderiza la vista de pago con error
        errors: [{ msg: 'Error al procesar el pago' }],
        companyInfo: req.app.locals.companyInfo // Información de la empresa
      });
    }
  }

  // Método para obtener todos los pagos
  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const payments = await this.paymentModel.getAll(); // Obtiene todos los pagos de la base de datos
      res.json(payments); // Devuelve los pagos en formato JSON
    } catch (error) {
      console.error('Error fetching payments:', error); // Registro de error al obtener los pagos
      res.status(500).json({ error: 'Error al obtener los pagos' }); // Devuelve un error en formato JSON
    }
  }
}