// Configuración de almacenamiento de sesiones en SQLite para producción
import session from "express-session";
import SQLiteStoreFactory from "connect-sqlite3";

const SQLiteStore = SQLiteStoreFactory(session);

export default SQLiteStore;
