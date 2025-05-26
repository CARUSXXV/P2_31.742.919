import nodemailer from 'nodemailer';
import { Contact } from '../models/ContactModel'; // Importa la interfaz Contact desde el modelo ContactModel
import dotenv from 'dotenv'; 

dotenv.config(); // Carga las variables de entorno desde el archivo .env

export class EmailService {
  // Define una clase estática EmailService para manejar el envío de correos electrónicos

  private static transporter = nodemailer.createTransport({
    // Crea un transportador de nodemailer con la configuración SMTP
    host: process.env.SMTP_HOST || 'smtp.gmail.com', // Usa el host SMTP de las variables de entorno o un valor por defecto
    port: parseInt(process.env.SMTP_PORT || '587'), // Usa el puerto SMTP de las variables de entorno o un valor por defecto
    secure: false,  
    auth: {
      user: process.env.SMTP_USER, // Usuario SMTP de las variables de entorno
      pass: process.env.SMTP_PASS // Contraseña SMTP de las variables de entorno
    }
  });

  public static async sendContactNotification(contact: Contact): Promise<void> {
    // Método estático para enviar una notificación de contacto por correo electrónico
    const { email, name, comment, ip_address, country, created_at } = contact;
    // Desestructura las propiedades del objeto contact

    // Filtra destinatarios para evitar undefined
    // Cabe destacar que Yopmail es un servicio de correos temporales y puede que no reciba correos enviados desde servidores SMTP autenticados (como Gmail).
    // El sistema realiza el envío correctamente a ambos, pero en cuanto a la recepción en Yopmail, depende de las políticas de ese servicio y no del código directamente, de igual forma, el correo será enviado a los 2 correos.
    const recipients = [process.env.SMTP_USER, 'programacion2ais@yopmail.com'].filter(Boolean) as string[];
    const mailOptions = {
      // Define las opciones del correo electrónico
      from: process.env.SMTP_USER, // Remitente del correo
      to: recipients, // Destinatarios del correo
      subject: 'Nuevo Contacto - AquaRepair', // Asunto del correo
      html: `
        <h2>Nuevo Mensaje de Contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Comentario:</strong> ${comment}</p>
        <p><strong>Dirección IP:</strong> ${ip_address}</p>
        <p><strong>País:</strong> ${country}</p>
        <p><strong>Fecha:</strong> ${created_at}</p>
      ` // Contenido HTML del correo
    };

    try {
      await this.transporter.sendMail(mailOptions); // Intenta enviar el correo electrónico
      console.log('Email notification sent successfully'); // Log de éxito
    } catch (error) {
      console.error('Error sending email notification:', error); // Log de error
      throw error; // Lanza el error para manejo posterior
    }
  }

  public static async sendPaymentConfirmation(payment: any): Promise<void> {
    // Método estático para enviar una confirmación de pago por correo electrónico
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: payment.email,
      subject: '¡Gracias por tu pago en AquaRepair!',
      html: `<h2>¡Pago recibido con éxito!</h2>
             <p>Hola <b>${payment.cardholder_name}</b>,</p>
             <p>Hemos recibido tu pago por el servicio solicitado. Pronto nos pondremos en contacto contigo.</p>
             <p><b>Monto:</b> ${payment.amount} ${payment.currency}</p>
             <p><b>Referencia:</b> ${payment.transaction_id || 'N/A'}</p>
             <br><p>¡Gracias por confiar en AquaRepair!</p>`
    };
    await this.transporter.sendMail(mailOptions); // Envía el correo electrónico de confirmación de pago
  }
}