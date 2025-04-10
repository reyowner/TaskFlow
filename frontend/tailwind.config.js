/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/styles/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        "army-green-800": "#4b5320",
        "army-green-700": "#5a632a",
        "army-green-500": "#6b8e23",
        "olive-600": "#8a9a5b",
        "olive-500": "#9aa86f",
        "khaki-300": "#bdb76b",
        "army-dark": "#3d4618",
        "army-light": "#f5f7e8",
        "army": "#b45309", 
      },
    },
  },
  plugins: [],
};
