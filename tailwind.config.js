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
        "assistant": ["assistant1", "sans-serif"],
        "tenorite-regular": ["tenoriteRegular", "sans-serif"],
        "tenorite-bold": ["tenoriteBold", "sans-serif"],
      },
    },
  },
  plugins: [],
}

