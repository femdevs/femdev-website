/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: "jit",
	content: [
		"node_modules/preline/dist/*.js",
		"views/**/**/**/*.{js,ts,pug,html}",
	],
	theme: {
		extend: {
			fontFamily: {
				poppins: ['Poppins', 'sans-serif'],
				roboto: ['Roboto', 'sans-serif'],
				inner: ["Inner", "sans-serif"],
				nunito: ["Nunito", "sans-serif"],
			},
			colors: {
				'brand-primary-light': '#4486cc',
				'brand-primary-inactive': '#6c81ba',
				'brand-primary': '#0034F0',
				'brand-primary-dark': '#000088',
				'brand-black': '#1A1A1A',
				'brand-black-dark': '#0D0D0D',
				'white': '#FFFFFF',
				'black': '#000000',
			},
			backdropBlur: { '10xl': '10rem' },
			keyframes: {
				'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
				'fade-out': { '0%': { opacity: '1' }, '100%': { opacity: '0' } },
			},
		},
	},
	plugins: [
		require('@tailwindcss/forms'),
		require('preline/plugin'),
	],
	experimental: { matchVariant: true, optimizeUniversalDefaults: true },
	darkMode: 'media',
};

