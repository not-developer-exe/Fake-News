/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}", // Make sure this covers your project structure
    ],
    darkMode: 'class', // <--- THIS IS THE CRUCIAL LINE
    theme: {
      extend: {
        fontFamily: {
           sans: ['Inter', 'sans-serif'], // Example: Adding Inter font
         },
         // Add any other theme customizations here
      },
    },
    plugins: [],
  }
  