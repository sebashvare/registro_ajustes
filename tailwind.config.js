/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#d8792c',
        'background-light': '#f8f7f6',
        'background-dark': '#201812',
        'secondary': '#59595B',
        'surface-light': '#FFFFFF',
        'surface-dark': '#2E2825',
        'text-light': '#1a1a1a',
        'text-dark': '#f5f5f5',
        'border-light': '#e0e0e0',
        'border-dark': '#423f3d'
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif']
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        'full': '9999px'
      },
      boxShadow: {
        'minimal-light': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'minimal-dark': '0 1px 3px 0 rgba(255, 255, 255, 0.08), 0 1px 2px 0 rgba(255, 255, 255, 0.06)'
      },
      transitionDuration: {
        'DEFAULT': '300ms'
      }
    }
  },
  plugins: []
};