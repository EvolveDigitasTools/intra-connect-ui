module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html,css}",
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'light': {
          'primary': '#0c66e4',
          'secondry': '#0052cce6',
          'background': '#172b4d',
          'navbar': '#ffffff',
          'border': '#dcdfe4',
          'text': '#0c66e4'
        },
        'dark': {
          'primary': '#579dff',
          'secondry': '#85b8ff',
          'background': '#1d2125',
          'navbar': '#1d2125',
          'border': '#333c43',
          'text': '#9fadbc',
          'secondry-button': '#9ca3af'
        },
      },
    },
    plugins: [
      require('flowbite/plugin')
    ],
  }
}