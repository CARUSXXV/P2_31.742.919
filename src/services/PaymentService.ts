import dotenv from 'dotenv'; 

dotenv.config(); 

interface PaymentRequest {
   
  'card-holder': string;
  amount: number;
  'card-number': string; 
  cvv: string;
  'expiration-month': string; 
  'expiration-year': string; 
  'full-name': string; 
  currency: string;
  description: string; 
  reference: string; 
}

interface PaymentResponse {
    // Define la interfaz PaymentResponse para la respuesta del servicio de pago
    success: boolean; // Indica si el pago fue exitoso
    message: string; 
    transactionId?: string; // ID de la transacción si el pago fue exitoso
    error?: {
    // Detalles del error si el pago falló
    code: string; // Código de error
    message: string; // Mensaje de error
  };
}

export class PaymentService {
  // Define una clase estática PaymentService para manejar pagos

  private static readonly API_KEY = process.env.FAKEPAYMENT_API_KEY || ''; // Clave de API (Desde el .env)
  // Carga la clave de API desde las variables de entorno
  private static readonly API_URL = process.env.FAKEPAYMENT_API_URL || ''; // URL de la API (Desde el .env)

  public static async processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    // Método estático asíncrono para procesar un pago
    try {
      const response = await fetch(`${this.API_URL}/payments`, {
        // Realiza una solicitud HTTP POST a la API de pagos
        method: 'POST', // Método HTTP
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`, // Autenticación con Bearer token
          'Content-Type': 'application/json' // Tipo de contenido JSON
        },
        body: JSON.stringify(paymentData) // Cuerpo de la solicitud con los datos de pago
      });

      const apiResponse = await response.json(); // Convierte la respuesta en formato JSON

      // Log ordenado del request y response
      console.log('--- FAKEPAYMENT API REQUEST ---');
      console.log(JSON.stringify(paymentData, null, 2));
      console.log('--- FAKEPAYMENT API RESPONSE ---');
      console.log(JSON.stringify(apiResponse, null, 2));

      if (!response.ok || apiResponse.success === false) {
        // Si la respuesta no es exitosa, lanza un error con el mensaje y el código de la API
        const err: any = new Error(apiResponse.message || 'Error processing payment');
        err.apiCode = apiResponse.code || '001';
        throw err;
      }

      // Extraer transaction_id y mensaje desde la estructura real de la API
      const transactionId = apiResponse.data?.transaction_id || apiResponse.transaction_id || apiResponse.transactionId;
      const message = apiResponse.message || 'Payment processed successfully';

      return {
        // Devuelve un objeto PaymentResponse indicando éxito
        success: true,
        message,
        transactionId
      };
    } catch (error) {
      // Log ordenado de error
      console.log('--- FAKEPAYMENT API ERROR ---');
      let apiErrorCode = '001';
      if (typeof error === 'object' && error !== null && 'apiCode' in error) {
        apiErrorCode = (error as any).apiCode;
      }
      if (typeof error === 'object' && error !== null && 'message' in error) {
        console.log((error as any).message);
      } else {
        console.log(error);
      }
      return {
        success: false,
        message: 'Payment processing failed',
        error: {
          code: apiErrorCode,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}