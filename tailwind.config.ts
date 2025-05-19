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
        animation: {
          'slide-in': 'slideInRight 0.3s ease-out',
        },
        keyframes: {
          slideInRight: {
            '0%': {
              opacity: '0',
              transform: 'translateX(30%)',
            },
            '100%': {
              opacity: '1',
              transform: 'translateX(0)',
            },
          },
        },
      }, // Yahan custom colors, fonts, ya spacing add kar sakte hain
    },
    plugins: [], // Yahan additional Tailwind plugins add kar sakte hain
  }