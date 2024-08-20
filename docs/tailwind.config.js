/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,jsx,ts,tsx,md,mdx}',
      './components/**/*.{js,jsx,ts,tsx,md,mdx}',
      './theme.config.tsx',
   
      // Or if using `src` directory:
      './src/**/*.{js,jsx,ts,tsx,md,mdx}',
    ],
    theme: {
      extend: {}
    },
    plugins: []
  }