import { Request, Response } from 'express';
import { ContactModel, Contact } from '../models/ContactModel';
import { body, validationResult } from 'express-validator';

export class ContactController {
  private contactModel = new ContactModel();

  // Validaciones para los campos del formulario de contacto
  public validations = [
    body('email').isEmail().withMessage('Email inválido'), // Validar formato de email
    body('name').notEmpty().withMessage('El nombre es requerido'), // Asegurar que el nombre no esté vacío
    body('comment').notEmpty().withMessage('El comentario es requerido') // Asegurar que el comentario no esté vacío
  ];

  // Método para agregar un nuevo contacto
  public async add(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('contact', { errors: errors.array() });
        return;
      }

      // Crear un objeto de contacto a partir del cuerpo de la solicitud
      const contact: Contact = {
        email: req.body.email,
        name: req.body.name,
        comment: req.body.comment,
        ip_address: req.ip || '127.0.0.1'
      };

      // Guardar el contacto en la base de datos
      await this.contactModel.add(contact);
      res.render('contact', { success: true });
    } catch (error) {
      console.error('Error saving contact:', error);
      res.render('contact', { 
        errors: [{ msg: 'Error al guardar el contacto' }]
      });
    }
  }

  public async index(req: Request, res: Response): Promise<void> {
    try {
      const contacts = await this.contactModel.getAll();
      res.render('admin/contacts', { contacts });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).send('Error al obtener los contactos');
    }
  }
}