/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: [
    "views/main/**/*.{js,ts,pug,html}",
    "views/defaults/**/*.{js,ts,pug,html}",
    "views/legal/**/*.{js,ts,pug,html}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        "assistant": ["assistant1", "sans-serif"],
        "tenorite-regular": ["tenoriteRegular", "sans-serif"],
        "tenorite-bold": ["tenoriteBold", "sans-serif"],
      },
      colors: {
        'brand-primary-light': '#88a8ff',
        'brand-primary': '#0034F0',
        'brand-primary-dark': '#000088',
        'brand-black': '#1A1A1A',
        'brand-black-dark': '#0D0D0D',
      },
      backdropBlur: {
        '10xl': '10rem',
      },
    },
  },
  plugins: [],
}

