import { Request, Response } from 'express';
import { PaymentModel, Payment } from '../models/PaymentModel';
import { body, validationResult } from 'express-validator';
import { PaymentService } from '../services/PaymentService';
import { EmailService } from '../services/EmailService';

export class PaymentController {
  private paymentModel = new PaymentModel();

  public validations = [
    body('email').isEmail().withMessage('Email inválido'),
    body('cardholder_name').notEmpty().withMessage('El nombre del titular es requerido'),
    body('card_number').isCreditCard().withMessage('Número de tarjeta inválido'),
    body('expiry_month').isInt({ min: 1, max: 12 }).withMessage('Mes inválido'),
    body('expiry_year').isInt({ min: 2024 }).withMessage('Año inválido'),
    body('cvv').isLength({ min: 3, max: 4 }).withMessage('CVV inválido'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Monto inválido'),
    body('currency').isIn(['USD', 'EUR']).withMessage('Moneda inválida'),
    body('service_id').isInt().withMessage('Servicio inválido')
  ];

  public async add(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('payment', { 
          errors: errors.array(),
          companyInfo: req.app.locals.companyInfo 
        });
        return;
      }

      const paymentData = {
        amount: parseFloat(req.body.amount),
        'card-number': req.body.card_number,
        cvv: req.body.cvv,
        'expiration-month': req.body.expiry_month,
        'expiration-year': req.body.expiry_year,
        'full-name': req.body.cardholder_name,
        'card-holder': req.body.cardholder_name, 
        currency: req.body.currency,
        description: `Service ID: ${req.body.service_id}`,
        reference: `REF-${Date.now()}`
      };

      let paymentResult;
      let payment: Payment;
      try {
        paymentResult = await PaymentService.processPayment(paymentData);
        // Guardar SIEMPRE el intento de pago, exitoso o fallido
        payment = {
          email: req.body.email,
          cardholder_name: req.body.cardholder_name,
          card_number: req.body.card_number,
          expiry_month: req.body.expiry_month,
          expiry_year: req.body.expiry_year,
          cvv: req.body.cvv,
          amount: parseFloat(req.body.amount),
          currency: req.body.currency,
          service_id: parseInt(req.body.service_id, 10),
          transaction_id: paymentResult.transactionId || undefined,
          status: paymentResult.success ? (paymentResult.message || 'Payment successful') : (paymentResult.error?.message || 'Rejected')
        };
        await this.paymentModel.add(payment);
        // Enviar correo de confirmación si el pago fue exitoso
        if (paymentResult.success) {
          try {
            await EmailService.sendPaymentConfirmation(payment);
          } catch (e) {
            console.error('No se pudo enviar el correo de confirmación:', e);
          }
        }
        if (paymentResult.success) {
          res.render('payment', {
            success: true,
            paymentResult,
            companyInfo: req.app.locals.companyInfo
          });
        } else {
          const userErrorMsg = process.env.NODE_ENV === 'development'
            ? paymentResult.error?.message || paymentResult.message
            : 'No se pudo procesar el pago. Intente nuevamente o contacte soporte.';
          res.render('payment', {
            errors: [{ msg: userErrorMsg }],
            companyInfo: req.app.locals.companyInfo
          });
        }
      } catch (error: any) {
        // Si ocurre un error inesperado, también registrar el intento fallido
        payment = {
          email: req.body.email,
          cardholder_name: req.body.cardholder_name,
          card_number: req.body.card_number,
          expiry_month: req.body.expiry_month,
          expiry_year: req.body.expiry_year,
          cvv: req.body.cvv,
          amount: parseFloat(req.body.amount),
          currency: req.body.currency,
          service_id: parseInt(req.body.service_id, 10),
          transaction_id: undefined,
          status: error?.message || 'Error'
        };
        await this.paymentModel.add(payment);
        res.render('payment', {
          errors: [{ msg: 'Error al procesar el pago' }],
          companyInfo: req.app.locals.companyInfo
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      res.render('payment', { 
        errors: [{ msg: 'Error al procesar el pago' }],
        companyInfo: req.app.locals.companyInfo 
      });
    }
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const payments = await this.paymentModel.getAll();
      res.json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ error: 'Error al obtener los pagos' });
    }
  }

  // Método para obtener todos los pagos como array (para la vista admin)
  public async getAllPaymentsArray(): Promise<Payment[]> {
    return await this.paymentModel.getAll();
  }
}