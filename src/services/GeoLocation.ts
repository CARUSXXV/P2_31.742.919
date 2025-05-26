import dotenv from 'dotenv'; 

dotenv.config(); 

export class GeoLocation {

  private static readonly API_KEY = process.env.IPSTACK_API_KEY;
  // Clave API para acceder a la API de ipstack, cargada desde las variables de entorno

  public static async getCountryFromIP(ip: string): Promise<string> {
    // Método estático para obtener el país a partir de una dirección IP
    try {
      const fetchModule = await import('node-fetch');
      // Importa dinámicamente el módulo node-fetch para realizar solicitudes HTTP
      const fetch = fetchModule.default;
      // Obtiene la función fetch del módulo importado

      const response = await fetch(`http://api.ipstack.com/${ip}?access_key=${this.API_KEY}&fields=country_name`);
      // Realiza una solicitud HTTP GET a la API de ipstack con la dirección IP y la clave API
      const data = await response.json() as { country_name?: string };
      // Convierte la respuesta en formato JSON y la tipa como un objeto con un campo opcional country_name
      return data.country_name || 'Unknown';
      // Devuelve el nombre del país si está disponible, de lo contrario, devuelve 'Unknown'
    } catch (error) {
      console.error('Error getting country from IP:', error);
      // Muestra un mensaje de error en la consola si ocurre un error durante la solicitud
      return 'Unknown';
      // Devuelve 'Unknown' en caso de error
    }
  }
}