# MiniDocumentación del Proyecto "AquaRepair"

Nombre y Apellido: Carmine Bernabei
C.I: 31.742.919

## 1. Descripción General

"AquaRepair" es una aplicación web moderna para un servicio de plomería profesional, con experiencia de usuario optimizada, panel administrativo seguro y gestión eficiente de contactos y pagos.

---

## 2. Estructura y Tecnologías

- **Backend:** Node.js + Express + TypeScript
- **Frontend:** EJS, CSS moderno, AOS, Swiper
- **Base de datos:** SQLite
- **Autenticación:** Local (email/contraseña) y Google OAuth2 para administradores
- **Sesiones:** express-session (cookies seguras, expiración por inactividad)
- **Servicios:** Email (SMTP), reCAPTCHA, GeoLocation (ipstack), Fake Payment API

### Estructura de carpetas

La estructura actual del proyecto es la siguiente:

- `/public`: Archivos estáticos (CSS, videos, imágenes)
  - `/css`: Hojas de estilo para formularios, paneles admin y estilos generales
  - `/videos`: Videos utilizados en la sección principal (Hero section)
- `/src`: Código fuente principal
  - `/controllers`: Lógica de negocio y validación de formularios
    - `AdminController.ts`: Login, dashboard y cambio de contraseña admin
    - `ContactController.ts`: Procesa y valida solicitudes de contacto
    - `PaymentController.ts`: Procesa y valida pagos
  - `/middleware`: Middlewares personalizados (ej. autenticación JWT)
    - `auth.ts`: Middleware para proteger rutas admin
  - `/models`: Modelos y acceso a la base de datos
    - `AdminModel.ts`: Gestión de admins y credenciales
    - `ContactModel.ts`: CRUD de contactos
    - `PaymentModel.ts`: CRUD de pagos
    - `Database.ts`: Singleton para conexión SQLite
  - `/services`: Servicios externos e integraciones
    - `GeoLocation.ts`: Consulta país por IP (ipstack)
    - `ReCaptcha.ts`: Validación de Google reCAPTCHA
    - `EmailService.ts`: Envío de emails vía SMTP (notificaciones y confirmaciones)
    - `PaymentService.ts`: Integración con Fake Payment API
  - `/views`: Plantillas EJS
    - `index.ejs`: Página principal
    - `contact.ejs`: Formulario de contacto
    - `payment.ejs`: Formulario de pago
    - `/admin`: Paneles administrativos
      - `contacts.ejs`: Visualización de contactos
      - `payments.ejs`: Visualización de pagos
      - `dashboard.ejs`: Dashboard con estadísticas
      - `login.ejs`: Login admin
      - `change-password.ejs`: Cambio de contraseña admin
    - `/partials`: Fragmentos reutilizables (head, navbar, footer, scripts)
  - `server.ts`: Servidor Express principal y configuración de rutas
  - `/scripts`: Scripts utilitarios (ej. creación de admin)
- `database.sqlite`: Base de datos SQLite local
- `.env`: Variables de entorno (no versionado)
- `README.md`: Documentación centralizada

**Notas adicionales:**
- Todos los servicios y credenciales sensibles se gestionan mediante variables de entorno.
- El acceso a los paneles administrativos está protegido por JWT.
- El sistema de correos usa una lista de destinatarios configurable en el código.
- La documentación previa se ha centralizado en este archivo.

## 2. Base de Datos

### 2.1 Tablas

**Admins**
```sql
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Contacts**
```sql
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  comment TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  country TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Payments**
```sql
CREATE TABLE payments (
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
  transaction_id TEXT,
  status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## 3. Características Principales

### 4.1 Formularios
- **Contacto:** Validación, reCAPTCHA, geolocalización, notificación por email, almacenamiento seguro.
- **Pago:** Validación, integración con Fake Payment API, confirmación automática por email, almacenamiento seguro.

### 4.2 Panel de Administración
- **Login seguro:**
  - Local (email/contraseña, bcrypt)
  - Google OAuth2 (botón "Iniciar con Google")
- **Gestión de sesión:**
  - express-session, cookies seguras (`httpOnly`, `sameSite`, `secure` en producción)
  - Expiración automática por inactividad (15 minutos)
  - Logout visual con icono
- **Cambio de contraseña**
- **Vistas protegidas:** `/admin/dashboard`, `/admin/contacts`, `/admin/payments`
- **Búsqueda en tablas:** JS en cliente (por nombre/email en contactos, por fecha/servicio/estado en pagos)
- **Metadatos Open Graph y Twitter Card**
- **Estadísticas y visualización de datos**

### 4.3 Seguridad
- Validación y sanitización de inputs
- Prevención de SQL injection
- Gestión segura de sesiones (NO se usa JWT)
- Variables de entorno para credenciales

---

## 5. Rutas Principales

- `/contact/add` (POST): Añadir contacto
- `/payment/add` (POST): Procesar pago
- `/admin/login` (GET/POST): Login admin (local y Google)
- `/admin/logout` (GET): Logout admin
- `/admin/dashboard` (GET): Dashboard admin
- `/admin/contacts` (GET): Ver contactos (admin)
- `/admin/payments` (GET): Ver pagos (admin)
- `/admin/change-password` (GET/POST): Cambio de contraseña admin

---

## 6. Créditos y Notas

- Desarrollado por Carmine Bernabei
- Para dudas o mejoras, contactar al autor

