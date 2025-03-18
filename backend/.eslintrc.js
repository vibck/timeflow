module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021
  },
  rules: {
    // Fehler und sicherheitsrelevante Probleme
    'no-console': 'off', // Im Backend ist console.log erlaubt
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warnung bei ungenutzten Variablen, ignoriere Argumente mit _
    'node/no-unsupported-features/es-syntax': 'off', // Moderne ES-Syntax erlauben

    // Stilregeln
    'semi': ['error', 'always'], // Semikolon immer erforderlich
    'quotes': ['warn', 'single'], // Einfache Anführungszeichen bevorzugt
    'indent': ['warn', 2], // 2 Leerzeichen Einrückung
    'comma-dangle': ['warn', 'never'], // Kein Komma am Ende von Objekten
    'object-curly-spacing': ['warn', 'always'], // Leerzeichen innerhalb von geschweiften Klammern
    'max-len': ['warn', { code: 120 }] // Zeilenlänge begrenzen
  }
}; 