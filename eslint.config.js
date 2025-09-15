import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: [
      '**/node_modules/**', 
      '**/dist/**', 
      '**/build/**',
      '.eslintrc.cjs',
      'app/dev-dist/**', // Ignore service worker files completely since they're generated
      'scripts/start-secure.cjs', // Ignore CommonJS script file
      // Add any other patterns that were in your .eslintignore file
      'app/vite.sw-dev.config.ts', // Ignore Vite SW dev config
    ]
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tseslintPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      // Add other TypeScript rules as needed
      
      // React rules
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  // Special config for JavaScript files
  {
    files: ['**/*.js'],
    rules: {
      // Disable TypeScript-specific rules for JS files
      '@typescript-eslint/no-require-imports': 'off'
    }
  }
];