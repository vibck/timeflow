// eslint.config.js
import { defineConfig } from 'eslint'

export default defineConfig({
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // React spezifische Regeln
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/prop-types': 'off', // Wir verzichten auf PropTypes, da wir mit modernem React arbeiten

    // Allgemeine Code-Qualität
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }], // console.log vermeiden, warn/error erlauben

    // Stilregeln
    'indent': ['warn', 2, { SwitchCase: 1 }],
    'quotes': ['warn', 'single', { avoidEscape: true }],
    'jsx-quotes': ['warn', 'prefer-double'],
    'semi': ['warn', 'always'],
    'comma-dangle': ['warn', 'never'],
    'arrow-parens': ['warn', 'as-needed'],
    'object-curly-spacing': ['warn', 'always']
  }
});
