import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node, // Cambiado a Node.js
    }
    // En esta parte, se pueden agregar reglas específicas para TypeScript o Node bajo el bloque rules, sin embargo, optaré por no incluir ninguna regla adicional para mantener la configuración más limpia.
    // rules: { }
  }
);