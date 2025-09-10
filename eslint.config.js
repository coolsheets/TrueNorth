import tseslint from 'typescript-eslint';
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
    ]
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    rules: {
      // We can see from the available rules that these exist
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