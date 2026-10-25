// tailwind.config.js (at the root of your Nx workspace)
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // ⭐️ Scan both your apps and your payment library
    join(__dirname, 'apps/**/*.{html,ts}'),
    join(__dirname, 'libs/**/*.{html,ts}'),
  ],
  corePlugins: {
    // ⭐️ Keeps your existing Bootstrap styles 100% safe (disables base CSS wipe)
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};