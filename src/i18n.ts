import path from "path";
import i18n from "i18n";

// Configuración de i18n
export default function configureI18n(app: any) {
  i18n.configure({
    locales: ["es", "en"],
    defaultLocale: "es",
    directory: path.join(__dirname, "../locales"),
    cookie: "lang",
    queryParameter: "lang",
    autoReload: true,
    updateFiles: false,
    objectNotation: true,
    register: global
  });
  app.use(i18n.init);
}
