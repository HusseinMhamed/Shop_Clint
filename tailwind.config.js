/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // يدعم الملفات التي تعمل عليها حالياً
  ],
  theme: {
    extend: {
      // هنا يمكنك إضافة الألوان المخصصة التي استخدمناها في الكومبوننت
      colors: {
        brand: {
          blue: "#1d70d2",
          dark: "#0f172a",
        },
      },
    },
  },
  plugins: [],
};
