/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        abyss: {
          950: '#020408',
          900: '#040914',
          800: '#071224',
          700: '#0c1b33',
        },
        hadal: {
          cyan: '#38bdf8',
          biolum: '#22d3ee',
          emerald: '#34d399',
          amber: '#fbbf24',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        serif: ['Newsreader', 'Cinzel', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
