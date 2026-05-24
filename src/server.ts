import express from "express";
import path from "path";
import livereload from "livereload";
import connectLivereload from "connect-livereload";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import connectSqlite3 from "connect-sqlite3";
import configureI18n from "./i18n";
import { formatDate, formatCurrency } from "./utils/localeHelpers";

// Extender la interfaz Request para TypeScript
import { Request } from "express";
declare module "express-session" {
  interface SessionData {
    userId?: number;
    isAdmin?: boolean;
  }
}

import { ContactController } from "./controllers/ContactController";
import { PaymentController } from "./controllers/PaymentController";
import { requireAuth } from "./middleware/auth";
import { AdminController } from "./controllers/AdminController";

// Configurar servidor de livereload
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "views"));
liveReloadServer.watch(path.join(__dirname, "public"));

// Configurar Express
const app = express();
const port = 3000;

// Agregar middleware de livereload
app.use(connectLivereload());

app.set("trust proxy", 1); // Si se usa proxy/reverse proxy

app.use(cookieParser()); // Middleware para leer cookies (necesario para autenticación admin)
app.use(bodyParser.urlencoded({ extended: true })); // Middleware para parsear bodies url-encoded (formularios).
app.use(bodyParser.json()); // Middleware para parsear bodies JSON.

const SQLiteStore = connectSqlite3(session);

// Configuración de sesión segura
app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.sqlite",
      dir: "./database",
    }) as any,
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // 15 minutos
    },
  })
);

// Inicializar passport y sesión
app.use(passport.initialize());
app.use(passport.session());

// Configurar estrategia de Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_CLIENT_SECRET",
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3000/auth/google/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: any) => void
    ) => {
      // Por simplicidad, guardamos el id y email en la sesión
      return done(null, {
        id: profile.id,
        email:
          profile.emails && profile.emails[0] ? profile.emails[0].value : null,
        displayName: profile.displayName,
      });
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user);
});
passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Middleware para reiniciar expiración por inactividad
app.use((req, res, next) => {
  if (req.session) {
    req.session.touch();
  }
  next();
});

// Middleware para establecer variables globales (ejemplo: companyInfo)
app.use((req, res, next) => {
  res.locals.companyInfo = companyInfo;
  res.locals.session = req.session;
  next();
});

// Configurar i18n antes de las rutas y antes de exponer helpers
configureI18n(app);

// Middleware para exponer idioma y helpers a las vistas
app.use((req, res, next) => {
  const reqAny = req as any;
  res.locals.locale = reqAny.locale || 'es';
  res.locals.__ = reqAny.__ ? reqAny.__.bind(reqAny) : (x: string) => x;
  res.locals.formatDate = formatDate;
  res.locals.formatCurrency = formatCurrency;
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "../public")));
console.log("Ruta de vistas configurada:", path.join(__dirname, "views"));

const contactController = new ContactController();
const paymentController = new PaymentController();
const adminController = new AdminController();

// Información relevante de la empresa
const companyInfo = {
  name: "CoreStack",
  slogan: "Soluciones de Ingeniería Informática Profesional",
  phone: "",
  email: "contacto@corestack.tech",
  address: "San Juan de Los Morros, Estado Guárico, Venezuela",
  socialMedia: {
    facebook: "#",
    instagram: "#",
    whatsapp: "#",
  },
  features: [
    {
      title: "Arquitectura Escalable",
      description: "Sistemas diseñados para crecer con tu negocio sin límites",
      icon: "stack",
    },
    {
      title: "Soporte Dedicado",
      description: "Atención personalizada y monitoreo continuo de tus sistemas",
      icon: "headphone",
    },
    {
      title: "Seguridad Garantizada",
      description: "Protección de datos con los más altos estándares de la industria",
      icon: "shield-check",
    },
    {
      title: "Equipo Experto",
      description: "Profesionales certificados en tecnologías de vanguardia",
      icon: "medal",
    },
  ],
  services: [
    {
      title: "Desarrollo Web",
      description:
        "Plataformas web dinámicas y modernas construidas con tecnologías de punta. Soluciones SaaS escalables y eficientes.",
      icon: "code-box",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      details: [
        "Aplicaciones web progresivas",
        "Plataformas SaaS en la nube",
        "Sistemas de gestión empresarial",
        "Paneles de control analíticos",
      ],
    },
    {
      title: "Consultoría TI",
      description:
        "Asesoría tecnológica integral para optimizar procesos y digitalizar tu empresa con las mejores prácticas del mercado.",
      icon: "service",
      image:
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      details: [
        "Transformación digital",
        "Arquitectura de software",
        "Optimización de infraestructura",
        "Seguridad informática",
      ],
    },
    {
      title: "SaaS & Cloud",
      description:
        "Soluciones en la nube para centralizar operaciones, inventarios y gestión de datos en tiempo real desde cualquier lugar.",
      icon: "cloud",
      image:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      details: [
        "Migración a la nube",
        "Gestión de bases de datos",
        "Automatización de procesos",
        "Infraestructura como servicio",
      ],
    },
  ],
  projects: [
    {
      title: "Plataforma E-commerce",
      description:
        "Sistema de comercio electrónico completo con panel admin y pasarela de pagos integrada",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Comercial",
    },
    {
      title: "Dashboard Analítico",
      description: "Plataforma de inteligencia de negocios con visualización de datos en tiempo real",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Empresarial",
    },
    {
      title: "App Móvil Corporativa",
      description: "Aplicación móvil multiplataforma para gestión de inventarios y operaciones",
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Corporativo",
    },
  ],
  testimonials: [
    {
      text: "CoreStack transformó nuestra gestión empresarial con su plataforma SaaS. Ahora tenemos control total de inventarios y procesos en tiempo real.",
      author: "María López",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
    {
      text: "El equipo de CoreStack desarrolló un dashboard analítico que revolucionó nuestra toma de decisiones. Totalmente recomendados.",
      author: "Pedro Castillo",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
    {
      text: "Buscábamos una solución tecnológica adaptada a Venezuela y CoreStack nos ofreció exactamente eso. Profesionales, innovadores y confiables.",
      author: "Ana Mendoza",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
  ],
  certifications: [
    "Registro SAREN",
    "Código de Comercio Venezolano",
    "Capital Social Bs. 100.000,00",
    "Junta Directiva Técnica",
  ],
  faqs: [
    {
      question: "¿Qué servicios de desarrollo ofrecen?",
      answer:
        "Ofrecemos desarrollo web, consultoría TI, aplicaciones SaaS en la nube y soluciones de software empresarial a medida.",
    },
    {
      question: "¿Cuánto tiempo toma desarrollar un proyecto?",
      answer:
        "Dependiendo de la complejidad, nuestros proyectos pueden tomar desde 2 semanas hasta varios meses. Trabajamos por sprints para garantizar resultados continuos.",
    },
    {
      question: "¿Ofrecen soporte post-lanzamiento?",
      answer:
        "Sí, todos nuestros desarrollos incluyen soporte técnico y mantenimiento por un período mínimo de 6 meses.",
    },
    {
      question: "¿Trabajan con PYMES venezolanas?",
      answer:
        "Sí, estamos especializados en soluciones para PYMES venezolanas, adaptando nuestra tecnología a las necesidades y presupuestos locales.",
    },
  ],
  stats: [
    {
      number: "5",
      label: "Fundadores",
    },
    {
      number: "50+",
      label: "Proyectos Entregados",
    },
    {
      number: "100%",
      label: "Compromiso",
    },
    {
      number: "24/7",
      label: "Soporte Técnico",
    },
  ],
};

// Rutas
app.get("/", (req: express.Request, res: express.Response) => {
  res.render("index", companyInfo);
});

app.get("/contact", (req: express.Request, res: express.Response) => {
  res.render("contact", {
    ...companyInfo,
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
  });
});

app.post(
  "/contact/add",
  contactController.validations,
  (req: express.Request, res: express.Response) => {
    contactController.add(req, res);
  }
);

// Ruta para verificar contactos
app.get(
  "/admin/contacts",
  requireAuth,
  (req: express.Request, res: express.Response) => {
    contactController.index(req, res);
  }
);

app.get("/payment", (req: express.Request, res: express.Response) => {
  res.render("payment", companyInfo);
});

app.post(
  "/payment/add",
  paymentController.validations,
  (req: express.Request, res: express.Response) => {
    paymentController.add(req, res);
  }
);

app.get("/payment/success", (req: express.Request, res: express.Response) => {
  res.render("payment-success", companyInfo);
});

app.get(
  "/api/payments",
  requireAuth,
  (req: express.Request, res: express.Response) => {
    paymentController.getAll(req, res);
  }
);

// Rutas de login y dashboard admin
app.get("/admin/login", (req, res) => {
  res.render("admin/login");
});
app.post("/admin/login", (req, res) => adminController.login(req, res));
app.get("/admin/logout", (req, res) => adminController.logout(req, res));

// Dashboard protegido con requireAuth
app.get("/admin/dashboard", requireAuth, (req, res) => {
  adminController.dashboard(req, res);
});

// Paneles admin protegidos
app.get("/admin/contacts", requireAuth, (req, res) => {
  contactController.index(req, res);
});
app.get("/admin/payments", requireAuth, async (req, res) => {
  const payments = await paymentController.getAllPaymentsArray();
  res.render("admin/payments", { payments });
});

// Cambiar contraseña (GET)
app.get("/admin/change-password", requireAuth, (req, res) => {
  res.render("admin/change-password");
});
// Cambiar contraseña (POST)
app.post("/admin/change-password", requireAuth, (req, res) =>
  adminController.changePassword(req, res)
);

// Rutas de autenticación con Google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/admin/login",
    failureMessage: true,
  }),
  (req: express.Request, res: express.Response) => {
    // Guardar datos en la sesión
    req.session.isAdmin = true;
    // @ts-ignore
    req.session.userId = req.user && req.user.id ? req.user.id : null;
    res.redirect("/admin/dashboard");
  }
);

app.get("/auth/logout", (req: express.Request, res: express.Response) => {
  // @ts-ignore
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect("/admin/login");
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
