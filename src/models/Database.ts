import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3'; 
import dotenv from 'dotenv'; // Importo dotenv para manejar variables de entorno

dotenv.config(); // Carga las variables de entorno desde un archivo .env

export class DatabaseConnection {
  private static instance: DatabaseConnection; 
  private db: Database; // Objeto de la base de datos

  // Constructor privado para evitar instanciación directa
  private constructor() {
    // Obtiene la ruta de la base de datos desde las variables de entorno o usa 'database.sqlite' por defecto
    const dbPath = process.env.DB_PATH || 'database.sqlite';
    // Conexión a la base de datos SQLite
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        // Manejo de error en la conexión
        console.error('Error connecting to database:', err);
      } else {
        // Confirmación de conexión exitosa
        console.log('Connected to SQLite database');
        // Inicialización de las tablas
        this.initializeTables();
      }
    });
  }

  // Método para obtener la instancia única de la clase
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      // Creación de la instancia si no existe
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  // Método para inicializar las tablas en la base de datos
  private initializeTables(): void {
    // Creación de la tabla 'contacts' si no existe
    this.db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL, 
        name TEXT NOT NULL,
        comment TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        country TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Creación de la tabla 'payments' si no existe
    this.db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        cardholder_name TEXT NOT NULL,
        card_number TEXT NOT NULL,
        expiry_month TEXT NOT NULL,
        expiry_year TEXT NOT NULL,
        cvv TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT NOT NULL,
        service_id INTEGER NOT NULL,
        country TEXT, 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // Método para obtener el objeto de la base de datos
  public getDatabase(): Database {
    return this.db;
  }
}