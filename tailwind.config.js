/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: [
    "views/**/**/*.{js,ts,pug,html}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        inner: ["Inner", "sans-serif"],
        "tenorite-regular": ["tenoriteRegular", "sans-serif"],
        "tenorite-bold": ["tenoriteBold", "sans-serif"],
      },
      colors: {
        'brand-primary-light': '#4486cc',
        'brand-primary-inactive': '#6c81ba',
        'brand-primary': '#0034F0',
        'brand-primary-dark': '#000088',
        'brand-black': '#1A1A1A',
        'brand-black-dark': '#0D0D0D',
        'white': '#FFFFFF',
      },
      backdropBlur: {
        '10xl': '10rem',
      },
    },
  },
  plugins: [],
  experimental: {
    matchVariant: true,
    optimizeUniversalDefaults: true, 
  }
}

