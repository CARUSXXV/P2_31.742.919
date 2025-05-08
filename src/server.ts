import express from 'express';
import path from 'path';
import livereload from 'livereload';
import connectLivereload from 'connect-livereload';
import bodyParser from 'body-parser';
import { ContactController } from './controllers/ContactController';
import { PaymentController } from './controllers/PaymentController';

const ADMIN_SECRET = "a1b2c3d4e5f6g7h8i9j0kLmNoPqRsTuVwXyZ1234567890"; // Clave de acceso para el administrador (para proteger rutas de pago y contactos)

// Middleware para verificar la clave de administrador
function isAuthorized(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.query.token || req.headers['x-admin-token']; // Busca el token en la URL o en los headers
  if (token === ADMIN_SECRET) {
   return next(); // Si la clave es correcta, continuar con la siguiente función
  } else {
    res.status(403).send('Acceso denegado'); // Si no, enviar error 403 (denegar acceso)
  }
}

// Configurar servidor de livereload 
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'views'));
liveReloadServer.watch(path.join(__dirname, 'public'));

// Configurar Express 
const app = express();
const port = 3000;

// Agregar middleware de livereload 
app.use(connectLivereload());

app.use(bodyParser.urlencoded({ extended: true })); // Middleware para parsear bodies url-encoded (formularios).
app.use(bodyParser.json()); // Middleware para parsear bodies JSON.

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '../public')));
console.log('Ruta de vistas configurada:', path.join(__dirname, 'views'));

const contactController = new ContactController();
const paymentController = new PaymentController();

// Información relevante de la empresa
const companyInfo = {
  name: "AquaRepair",
  slogan: "Soluciones de Plomería Profesional 24/7",
  phone: "+58 0412-0367234",
  email: "info.aquarepair.ve@gmail.com",
  address: "San Juan de Los Morros, Venezuela",
  socialMedia: {
    facebook: "#",
    instagram: "#",
    whatsapp: "#"
  },
  features: [
    {
      title: "Respuesta Rápida",
      description: "Atención inmediata en menos de 30 minutos",
      icon: "timer-flash"
    },
    {
      title: "Servicio 24/7",
      description: "Disponibles día y noche, incluso festivos",
      icon: "24-hours"
    },
    {
      title: "Garantía Total",
      description: "100% satisfacción garantizada en cada servicio",
      icon: "shield-check"
    },
    {
      title: "Equipo Certificado",
      description: "Profesionales altamente capacitados",
      icon: "medal"
    }
  ],
  services: [
    {
      title: "Emergencias 24/7",
      description: "Respuesta inmediata para emergencias de plomería a cualquier hora. Nuestro equipo está preparado para atender cualquier urgencia.",
      icon: "alert-circle",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      details: [
        "Fugas de agua",
        "Tuberías rotas",
        "Inundaciones",
        "Problemas de drenaje"
      ]
    },
    {
      title: "Reparaciones Precisas",
      description: "Diagnóstico experto y reparaciones duraderas con las mejores herramientas y técnicas del mercado.",
      icon: "tool",
      image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      details: [
        "Reparación de grifos",
        "Arreglo de inodoros",
        "Reparación de tuberías",
        "Mantenimiento preventivo"
      ]
    },
    {
      title: "Instalaciones Modernas",
      description: "Instalación profesional con tecnología de vanguardia para asegurar la máxima eficiencia y durabilidad.",
      icon: "settings",
      image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      details: [
        "Sistemas de agua",
        "Calentadores",
        "Bombas de agua",
        "Sistemas de filtración"
      ]
    }
  ],
  projects: [
    {
      title: "Renovación Completa",
      description: "Renovación total del sistema de plomería en edificio residencial",
      image: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Residencial"
    },
    {
      title: "Instalación Comercial",
      description: "Sistema de plomería para nuevo centro comercial",
      image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Comercial"
    },
    {
      title: "Mantenimiento Industrial",
      description: "Mantenimiento preventivo en planta industrial",
      image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Industrial"
    }
  ],
  testimonials: [
    {
      text: "Servicio excepcional. Llegaron en minutos cuando tuve una emergencia de plomería. El técnico fue muy profesional y resolvió el problema rápidamente.",
      author: "Carlos Méndez",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
    },
    {
      text: "Profesionales, puntuales y precios justos. Totalmente recomendados. Han realizado varios trabajos en mi casa y siempre con excelentes resultados.",
      author: "Ana García",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
    },
    {
      text: "La mejor empresa de plomería que he contratado. Trabajo impecable y personal muy capacitado. Resolvieron un problema complejo que otras empresas no pudieron.",
      author: "Roberto Sánchez",
      rating: 5,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
    }
  ],
  certifications: [
    "Certificación Master Plumber",
    "ISO 9001:2015",
    "Asociación Nacional de Plomería",
    "Green Plumbing Certified"
  ],
  faqs: [
    {
      question: "¿Cuánto tiempo tardan en llegar?",
      answer: "Nuestro tiempo de respuesta promedio es de 30 minutos en casos de emergencia."
    },
    {
      question: "¿Ofrecen garantía por el servicio?",
      answer: "Sí, todos nuestros trabajos tienen garantía de 6 meses a 1 año, dependiendo del tipo de servicio."
    },
    {
      question: "¿Trabajan los fines de semana?",
      answer: "Sí, ofrecemos servicio 24/7, incluyendo fines de semana y días festivos."
    },
    {
      question: "¿Cuáles son sus formas de pago?",
      answer: "Aceptamos efectivo, tarjetas de crédito/débito, transferencias bancarias y pagos móviles."
    }
  ],
  stats: [
    {
      number: "15+",
      label: "Años de Experiencia"
    },
    {
      number: "10000+",
      label: "Clientes Satisfechos"
    },
    {
      number: "24/7",
      label: "Servicio Disponible"
    },
    {
      number: "30min",
      label: "Tiempo de Respuesta"
    }
  ]
};

// Rutas
app.get('/', (req: express.Request, res: express.Response) => {
  res.render('index', companyInfo);
});

app.get('/contact', (req: express.Request, res: express.Response) => {
  res.render('contact', companyInfo);
});

app.post('/contact/add', contactController.validations, (req: express.Request, res: express.Response) => {
  contactController.add(req, res);
});

// Ruta para verificar contactos protegida con token
app.get('/admin/contacts', isAuthorized, (req: express.Request, res: express.Response) => {
  contactController.index(req, res);
});

app.get('/payment', (req: express.Request, res: express.Response) => {
  res.render('payment', companyInfo);
});

app.post('/payment/add', paymentController.validations, (req: express.Request, res: express.Response) => {
  paymentController.add(req, res);
});

app.get('/payment/success', (req: express.Request, res: express.Response) => {
  res.render('payment-success', companyInfo);
});

// Ruta para verificar pagos protegida con token
app.get('/api/payments', isAuthorized, (req: express.Request, res: express.Response) => {
    paymentController.getAll(req, res);
});


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

