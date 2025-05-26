# MiniDocumentación del Proyecto "AquaRepair"

Nombre y Apellido: Carmine Bernabei
C.I: 31.742.919

## 1. Descripción General

En resumidas cuentas, "AquaRepair" es una aplicación web con un estilo moderno para un servicio de plomería profesional, diseñada para ofrecer una experiencia de usuario acogedora y una presentación visual atractiva, además de tener una llamada a la acción pronunciada, ya que se trata de un servicio de plomería/fontanería urgente.

## 2. Estructuración del Proyecto

### 2.1 Tecnologías Principales Utilizadas
- Node.js con Express
- EJS como motor de plantillas
- TypeScript para tipado estático
- CSS moderno con variables personalizadas
- Bibliotecas: AOS (Animate On Scroll), Swiper (Deslizador)

### 2.2 Arquitectura

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

## 3. Características Implementadas

### 3.1 Formulario de Contacto
- Validación de campos y reCAPTCHA
- Captura de IP y país del usuario
- Timestamp automático
- Almacenamiento en SQLite
- Notificación por correo a múltiples destinatarios
- Vista administrativa protegida

### 3.2 Formulario de Pago
- Validación de tarjeta de crédito y campos
- Selección de servicios y monedas
- Almacenamiento seguro
- Integración con Fake Payment API
- Confirmación automática por correo electrónico al usuario
- Vista administrativa protegida

### 3.3 Panel de Administración
- Login seguro con JWT
- Dashboard con estadísticas y gráficos
- Cambio de contraseña admin
- Visualización de contactos y pagos

## 4. Seguridad
- Validaciones y sanitización de inputs
- Prevención de SQL injection
- Uso de JWT para autenticación admin
- Variables de entorno para credenciales
- Cookies httpOnly para tokens

## 5. Rutas Implementadas

### 5.1 Contactos
- POST `/contact/add`: Añadir nuevo contacto
- GET `/admin/contacts`: Ver todos los contactos (admin)

### 5.2 Pagos
- POST `/payment/add`: Procesar nuevo pago
- GET `/admin/payments`: Ver todos los pagos (admin)
- GET `/payment/success`: Confirmación de pago
- GET `/api/payments`: API de pagos (admin)

### 5.3 Admin
- GET `/admin/login`: Login admin
- POST `/admin/login`: Procesar login
- GET `/admin/dashboard`: Dashboard admin
- GET `/admin/change-password`: Formulario de cambio de contraseña
- POST `/admin/change-password`: Procesar cambio de contraseña
- GET `/admin/logout`: Cerrar sesión

---

# Documentación de Servicios e Integraciones

Este proyecto implementa un sistema web con múltiples servicios y medidas de seguridad, pedidas a detalle dentro de las especificaciones de la Task 3. A continuación se describen detalladamente las integraciones y servicios añadidos:

---

## 1. Geolocalización por IP (ipstack).

En esta ocasión preferí utilizar ipstack por encima de ipapi, esta decisión la tome después de investigar y leer que esta API suele ser mas efectiva y precisa.

- **Descripción:** Permite obtener el país de origen del usuario a partir de su dirección IP.
- **Implementación:**
  - Servicio en `src/services/GeoLocation.ts`.
  - Utiliza la API de ipstack para consultar la IP y obtener el país.
  - El resultado se almacena en la base de datos y se utiliza en notificaciones por correo.
- **Uso:**
  - Se llama una sola vez por contacto para optimizar el consumo de la API. (En este caso son 100 usos debido al plan gratuito).
  - La clave de ipstack se almacena en el archivo `.env` como `IPSTACK_API_KEY`.

## 2. Google Analytics
- **Descripción:** Permite el seguimiento de visitas y eventos en la web.
- **Implementación:**
  - El código de seguimiento se incluye en `src/views/partials/head.ejs`.
  - El ID de medición se almacena en `.env` como `GA_MEASUREMENT_ID`.
- **Ventaja:**
  - Permite analizar el tráfico y comportamiento de los usuarios sin exponer el ID en el código fuente.

## 3. Google reCAPTCHA
- **Descripción:** Protege los formularios contra bots y spam. Se optó por el reCAPTCHA v2.
- **Implementación:**
  - Integrado en el formulario de contacto (`contact.ejs`) y validado en backend (`src/services/ReCaptcha.ts`).
  - El token del usuario se verifica contra la API de Google antes de aceptar el formulario.
  - La clave secreta se almacena en `.env` como `RECAPTCHA_SECRET_KEY` y la clave pública como `RECAPTCHA_SITE_KEY`.
- **Ventaja:**
  - Mejora la seguridad y la experiencia del usuario.

## 4. Notificación por correo electrónico
- **Descripción:** Envía un email al administrador cada vez que se recibe un nuevo contacto.
- **Implementación:**
  - Servicio en `src/services/EmailService.ts` usando `nodemailer`.
  - Los datos del contacto y su país se incluyen en el correo.
  - Las credenciales SMTP se almacenan en `.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
- **Ventaja:**
  - Permite recibir notificaciones inmediatas y mantener la privacidad de las credenciales.

## 5. Integración con Fake Payment API
- **Descripción:** Permite simular pagos y probar distintos escenarios (aprobado, rechazado, error, fondos insuficientes).
- **Implementación:**
  - Servicio en `src/services/PaymentService.ts`.
  - El controlador de pagos (`PaymentController.ts`) envía los datos a la API y guarda el resultado (incluyendo el ID de transacción y estado) en la base de datos.
  - Los endpoints y credenciales de la API se almacenan en `.env` (`FAKEPAYMENT_API_URL`, `FAKEPAYMENT_API_KEY`).
  - Panel de administración visual para pagos en `/admin/payments?token=...`.
- **Ventaja:**
  - Permite pruebas seguras y controladas sin exponer datos reales.

## 6. Seguridad con variables de entorno
- **Descripción:** Todas las credenciales y datos sensibles se almacenan en el archivo `.env` y nunca en el código fuente.
- **Implementación:**
  - Uso de `dotenv` para cargar variables de entorno.
  - Ejemplos de variables:
    - `RECAPTCHA_SECRET_KEY`, `RECAPTCHA_SITE_KEY`
    - `IPSTACK_API_KEY`
    - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
    - `FAKEPAYMENT_API_URL`, `FAKEPAYMENT_API_KEY`
- **Ventaja:**
  - Facilita el despliegue seguro y evita la exposición accidental de credenciales.

## Confirmación automática por correo electrónico

- Cuando un usuario completa exitosamente un formulario de pago, el sistema envía automáticamente un correo de confirmación y bienvenida a la dirección proporcionada.
- El correo incluye detalles del pago y un mensaje de agradecimiento.
- Esta funcionalidad está implementada en `EmailService.ts` y es llamada desde el controlador de pagos.

## Seguridad JWT

- El secreto JWT (`JWT_SECRET`) se encuentra en el archivo `.env` y debe ser único y seguro. Ejemplo: `JWT_SECRET=3x@mpl3S3cr3tK3y!2023`.

---

