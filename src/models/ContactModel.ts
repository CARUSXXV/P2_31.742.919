import { DatabaseConnection } from './Database';

export interface Contact {
  id?: number; 
  email: string; 
  name: string; 
  comment: string; 
  ip_address: string; 
  country?: string; 
  created_at?: string; 
}

// Clase ContactModel para manejar las operaciones de base de datos relacionadas con los contactos
export class ContactModel {
  // Obtiene la instancia única de la conexión a la base de datos
  private db = DatabaseConnection.getInstance().getDatabase();

  // Método para agregar un nuevo contacto a la base de datos
  public async add(contact: Contact): Promise<number> {
    return new Promise((resolve, reject) => {
      // Desestructuración de los campos del contacto
      const { email, name, comment, ip_address, country } = contact;
      // Inserta un nuevo contacto en la tabla 'contacts'
      this.db.run(
        'INSERT INTO contacts (email, name, comment, ip_address, country) VALUES (?, ?, ?, ?, ?)',
        [email, name, comment, ip_address, country],
        function(err) {
          if (err) {
            // Rechaza la promesa si hay un error
            reject(err);
          } else {
            // Resuelve la promesa con el ID del último contacto insertado
            resolve(this.lastID);
          }
        }
      );
    });
  }

  // Método para obtener todos los contactos de la base de datos
  public async getAll(): Promise<Contact[]> {
    return new Promise((resolve, reject) => {
      // Selecciona todos los contactos ordenados por fecha de creación descendente
      this.db.all('SELECT * FROM contacts ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          // Rechaza la promesa si hay un error
          reject(err);
        } else {
          // Resuelve la promesa con la lista de contactos
          resolve(rows as Contact[]);
        }
      });
    });
  }

  // Método para obtener un contacto por ID
  public async getById(id: number): Promise<Contact | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM contacts WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as Contact || null);
        }
      });
    });
  }
}