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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "../public")));
console.log("Ruta de vistas configurada:", path.join(__dirname, "views"));

const contactController = new ContactController();
const paymentController = new PaymentController();
const adminController = new AdminController();

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
    whatsapp: "#",
  },
  features: [
    {
      title: "Respuesta Rápida",
      description: "Atención inmediata en menos de 30 minutos",
      icon: "timer-flash",
    },
    {
      title: "Servicio 24/7",
      description: "Disponibles día y noche, incluso festivos",
      icon: "24-hours",
    },
    {
      title: "Garantía Total",
      description: "100% satisfacción garantizada en cada servicio",
      icon: "shield-check",
    },
    {
      title: "Equipo Certificado",
      description: "Profesionales altamente capacitados",
      icon: "medal",
    },
  ],
  services: [
    {
      title: "Emergencias 24/7",
      description:
        "Respuesta inmediata para emergencias de plomería a cualquier hora. Nuestro equipo está preparado para atender cualquier urgencia.",
      icon: "alert-circle",
      image:
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      details: [
        "Fugas de agua",
        "Tuberías rotas",
        "Inundaciones",
        "Problemas de drenaje",
      ],
    },
    {
      title: "Reparaciones Precisas",
      description:
        "Diagnóstico experto y reparaciones duraderas con las mejores herramientas y técnicas del mercado.",
      icon: "tool",
      image:
        "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      details: [
        "Reparación de grifos",
        "Arreglo de inodoros",
        "Reparación de tuberías",
        "Mantenimiento preventivo",
      ],
    },
    {
      title: "Instalaciones Modernas",
      description:
        "Instalación profesional con tecnología de vanguardia para asegurar la máxima eficiencia y durabilidad.",
      icon: "settings",
      image:
        "https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      details: [
        "Sistemas de agua",
        "Calentadores",
        "Bombas de agua",
        "Sistemas de filtración",
      ],
    },
  ],
  projects: [
    {
      title: "Renovación Completa",
      description:
        "Renovación total del sistema de plomería en edificio residencial",
      image:
        "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Residencial",
    },
    {
      title: "Instalación Comercial",
      description: "Sistema de plomería para nuevo centro comercial",
      image:
        "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Comercial",
    },
    {
      title: "Mantenimiento Industrial",
      description: "Mantenimiento preventivo en planta industrial",
      image:
        "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Industrial",
    },
  ],
  testimonials: [
    {
      text: "Servicio excepcional. Llegaron en minutos cuando tuve una emergencia de plomería. El técnico fue muy profesional y resolvió el problema rápidamente.",
      author: "Carlos Méndez",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
    {
      text: "Profesionales, puntuales y precios justos. Totalmente recomendados. Han realizado varios trabajos en mi casa y siempre con excelentes resultados.",
      author: "Ana García",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
    {
      text: "La mejor empresa de plomería que he contratado. Trabajo impecable y personal muy capacitado. Resolvieron un problema complejo que otras empresas no pudieron.",
      author: "Roberto Sánchez",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
  ],
  certifications: [
    "Certificación Master Plumber",
    "ISO 9001:2015",
    "Asociación Nacional de Plomería",
    "Green Plumbing Certified",
  ],
  faqs: [
    {
      question: "¿Cuánto tiempo tardan en llegar?",
      answer:
        "Nuestro tiempo de respuesta promedio es de 30 minutos en casos de emergencia.",
    },
    {
      question: "¿Ofrecen garantía por el servicio?",
      answer:
        "Sí, todos nuestros trabajos tienen garantía de 6 meses a 1 año, dependiendo del tipo de servicio.",
    },
    {
      question: "¿Trabajan los fines de semana?",
      answer:
        "Sí, ofrecemos servicio 24/7, incluyendo fines de semana y días festivos.",
    },
    {
      question: "¿Cuáles son sus formas de pago?",
      answer:
        "Aceptamos efectivo, tarjetas de crédito/débito, transferencias bancarias y pagos móviles.",
    },
  ],
  stats: [
    {
      number: "15+",
      label: "Años de Experiencia",
    },
    {
      number: "10000+",
      label: "Clientes Satisfechos",
    },
    {
      number: "24/7",
      label: "Servicio Disponible",
    },
    {
      number: "30min",
      label: "Tiempo de Respuesta",
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
