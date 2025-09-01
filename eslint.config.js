// eslint.config.js
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  // TypeScript files in app directory
  {
    files: ['app/**/*.{ts,tsx}'],
    ignores: ['node_modules/**/*', 'dist/**/*', '**/build/**', 'app/**/*.d.ts', 'app/vite.config.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './app/tsconfig.json', // Point to app's tsconfig
        ecmaVersion: 2022,
        ecmaFeatures: { jsx: true },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        location: 'readonly',
        history: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        confirm: 'readonly',
        alert: 'readonly',
        Event: 'readonly',
        // React globals
        React: 'readonly',
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      // Disable some rules that cause noise in browser environments
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn'
    },
  },
  // TypeScript declaration files - less strict checking
  {
    files: ['app/**/*.d.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
      },
      globals: {
        // TypeScript declaration files globals
        ServiceWorkerGlobalScope: 'readonly',
        ServiceWorkerRegistration: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        URL: 'readonly',
        ExtendableEvent: 'readonly',
        CacheQueryOptions: 'readonly',
        RequestInit: 'readonly',
        // Any other globals that might be needed
      }
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off', // Turn off for d.ts files
    },
  },
  // Vite config file
  {
    files: ['app/vite.config.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
      },
      globals: {
        // Node.js globals needed for vite.config.ts
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
    },
  },
  // Service Worker files
  {
    files: ['app/src/sw.ts'],
    ignores: ['node_modules/**/*', 'dist/**/*', '**/build/**'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './app/tsconfig.sw.json',
        ecmaVersion: 2022,
      },
      globals: {
        // Service Worker globals
        self: 'readonly',
        caches: 'readonly',
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        importScripts: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        URL: 'readonly',
        location: 'readonly',
        registration: 'readonly',
        // IndexedDB
        IDBDatabase: 'readonly',
        IDBTransaction: 'readonly',
        IDBObjectStore: 'readonly',
        IDBIndex: 'readonly',
        IDBCursor: 'readonly',
        IDBRequest: 'readonly',
        indexedDB: 'readonly',
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn'
    },
  },
  // Server files - CommonJS
  {
    files: ['server/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      ecmaVersion: 2020,
      globals: {
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'warn',
      'no-redeclare': 'off', // Turn off for server code
      'no-undef': 'off', // Turn off for server code - caused by CJS modules
    },
  },
  // Ignore dist/build folders entirely
  {
    files: ['**/dist/**', '**/build/**', 'node_modules/**'],
    ignores: [],
    rules: {
      // Disable all rules for dist/build folders
      ...Object.fromEntries(
        Object.keys(js.configs.recommended.rules || {}).map(key => [key, 'off'])
      ),
    },
  },
];