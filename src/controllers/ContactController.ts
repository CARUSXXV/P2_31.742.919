import { Request, Response } from 'express';
import { ContactModel, Contact } from '../models/ContactModel';
import { body, validationResult } from 'express-validator';
import { ReCaptcha } from '../services/ReCaptcha';
import { GeoLocation } from '../services/GeoLocation';
import { EmailService } from '../services/EmailService';

// Controlador para manejar las operaciones relacionadas con los contactos
export class ContactController {
  private contactModel = new ContactModel();

  // Validaciones para los campos del formulario de contacto
  public validations = [
    body('email').isEmail().withMessage('Email inválido'),
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('comment').notEmpty().withMessage('El comentario es requerido'),
    body('g-recaptcha-response').notEmpty().withMessage('Por favor, complete el reCAPTCHA')
  ];

  // Método para agregar un nuevo contacto
  public async add(req: Request, res: Response): Promise<void> {
    try {
      // Verificar si hay errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('contact', { errors: errors.array() });
        return;
      }

      // Verificar el reCAPTCHA
      const isRecaptchaValid = await ReCaptcha.verify(req.body['g-recaptcha-response']);
      if (!isRecaptchaValid) {
        res.render('contact', { 
          errors: [{ msg: 'reCAPTCHA inválido' }]
        });
        return;
      }

      // Obtener el país a partir de la dirección IP
      const country = await GeoLocation.getCountryFromIP(req.ip || '127.0.0.1');

      // Crear un objeto de contacto con los datos del formulario
      const contact: Contact = {
        email: req.body.email,
        name: req.body.name,
        comment: req.body.comment,
        ip_address: req.ip || '127.0.0.1',
        country: country
      };

      // Agregar el contacto a la base de datos y obtener el ID
      const insertedId = await this.contactModel.add(contact);
      // Obtener el contacto completo (incluyendo created_at)
      const savedContact = await this.contactModel.getById(insertedId);
      if (savedContact) {
        // Enviar una notificación por correo electrónico con la fecha correcta
        await EmailService.sendContactNotification(savedContact);
      }
      // Renderizar la vista de contacto con éxito
      res.render('contact', { success: true });
    } catch (error) {
      // Manejo de errores mejorado
      console.error('Error al guardar el contacto:', {
        error,
        ip: req.ip,
        email: req.body.email,
        fecha: new Date().toISOString()
      });
      const userErrorMsg = process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : 'Error desconocido')
        : 'No se pudo guardar el contacto. Intente nuevamente o contacte soporte.';
      res.render('contact', { 
        errors: [{ msg: userErrorMsg }]
      });
    }
  }

  // Método para mostrar todos los contactos
  public async index(req: Request, res: Response): Promise<void> {
    try {
      // Obtener todos los contactos de la base de datos
      const contacts = await this.contactModel.getAll();
      // Renderizar la vista de administración de contactos
      res.render('admin/contacts', { contacts });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).send('Error al obtener los contactos');
    }
  }
}