import express from 'express';
import path from 'path';
import livereload from 'livereload';
import connectLivereload from 'connect-livereload';

// Configurar servidor de livereload
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'views'));
liveReloadServer.watch(path.join(__dirname, 'public'));

// Configurar Express
const app = express();
const port = 3000;

// Agregar middleware de livereload
app.use(connectLivereload());

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Información personal
const personalInfo = {
  fullName: "Carmine Bernabei",
  idNumber: "31.742.919",
  section: 4
};

// Rutas
app.get('/', (req, res) => {
  res.render('index', personalInfo);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

