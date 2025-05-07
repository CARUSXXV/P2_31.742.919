import { DatabaseConnection } from './Database';

// Interfaz que define la estructura de un contacto
export interface Contact {
  id?: number; // ID del contacto
  email: string; // Correo electrónico
  name: string; // Nombre del contacto
  comment: string; // Comentario 
  ip_address: string; // Dirección IP del contacto
  created_at?: string; // Fecha de creación 
}

// Clase para manejar operaciones relacionadas con los contactos
export class ContactModel {
  // Obtención de la instancia de la base de datos
  private db = DatabaseConnection.getInstance().getDatabase();

  // Método para agregar un nuevo contacto a la base de datos
  public async add(contact: Contact): Promise<number> {
    return new Promise((resolve, reject) => {
      const { email, name, comment, ip_address } = contact;
      // Inserción de los datos del contacto en la tabla 'contacts'
      this.db.run(
        'INSERT INTO contacts (email, name, comment, ip_address) VALUES (?, ?, ?, ?)',
        [email, name, comment, ip_address],
        function(err) {
          if (err) {
            // Rechazo de la promesa en caso de error
            reject(err);
          } else {
            // Resolución de la promesa con el ID del último contacto insertado
            resolve(this.lastID);
          }
        }
      );
    });
  }

  // Método para obtener todos los contactos de la base de datos
  public async getAll(): Promise<Contact[]> {
    return new Promise((resolve, reject) => {
      // Selección de todos los contactos ordenados por fecha de creación
      this.db.all('SELECT * FROM contacts ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          // Rechazo de la promesa en caso de error
          reject(err);
        } else {
          // Resolución de la promesa con los contactos obtenidos
          resolve(rows as Contact[]);
        }
      });
    });
  }
}

