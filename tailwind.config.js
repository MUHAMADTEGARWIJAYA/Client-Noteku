/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FBB75F',
        secondary: '#18181B',
        tertiary: '#0000FF',
        groupprimary: '#3a3852',
        groupsecondary: '#4a4360',
        grouptertiary: '#afbcf3',
        groupquaternary: '#fefefc',
      },
    },
  },
  plugins: [],
}
