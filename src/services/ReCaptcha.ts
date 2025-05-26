import { config } from 'dotenv';

// Carga las variables de entorno desde un archivo .env
config();

// Define la interfaz para la respuesta de reCAPTCHA
interface ReCaptchaResponse {
  success: boolean; 
}

// Clase para manejar la verificación de reCAPTCHA
export class ReCaptcha {
  // Clave secreta de reCAPTCHA
  private static readonly SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

  // Método estático para verificar el token de reCAPTCHA
  public static async verify(token: string): Promise<boolean> {
    try {
      // Importación dinámica de node-fetch para realizar solicitudes HTTP
      const fetchModule = await import('node-fetch');
      const fetch = fetchModule.default;
      type Response = Awaited<ReturnType<typeof fetch>>;

      // Realiza una solicitud POST al servicio de verificación de reCAPTCHA de Google
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        // Envía la clave secreta y el token de reCAPTCHA en el cuerpo de la solicitud
        body: `secret=${this.SECRET_KEY}&response=${token}`,
      }) as Response;

      // Convierte la respuesta a JSON y verifica si fue exitosa
      const data = await response.json() as ReCaptchaResponse;
      return data.success;
    } catch (error) {
      // Manejo de errores en caso de que la verificación falle
      console.error('Error verifying reCAPTCHA:', error);
      return false;
    }
  }
}