/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}", // Next.js App Router ke liye
      "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Next.js Pages Router ke liye
      "./components/**/*.{js,ts,jsx,tsx,mdx}", // Components folder
      "./src/**/*.{js,ts,jsx,tsx,mdx}", // Agar aap src folder use karte hain
    ],
    theme: {
      extend: {
        colors: {
          'dark-2': '#161925',
          1: '#dd6248', 
          2: '#161925'// Define bg-dark-2 if it’s custom
        },
      }, // Yahan custom colors, fonts, ya spacing add kar sakte hain
    },
    plugins: [], // Yahan additional Tailwind plugins add kar sakte hain
  }