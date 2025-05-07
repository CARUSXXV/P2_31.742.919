import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';

// Clase para manejar la conexión a la base de datos
export class DatabaseConnection {
  // Instancia única de la clase (patrón Singleton)
  private static instance: DatabaseConnection;
  // Objeto de la base de datos
  private db: Database;

  // Constructor privado para evitar instanciación directa
  private constructor() {
    // Conexión a la base de datos SQLite
    this.db = new sqlite3.Database('database.sqlite', (err) => {
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // Método para obtener el objeto de la base de datos
  public getDatabase(): Database {
    return this.db;
  }
}