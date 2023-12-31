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
          'background-secondry': '#f9fafb',
          'navbar': '#fffffff2',
          // 'navbar': '#ffffff',
          'border': '#dcdfe4',
          'text': '#0c66e4',
          'main-text': '#fffffff2',
          'list': '#f1f2f4',
          'list-action-hover': '#d0d4db',
          'card': '#ffffff'
          // 'main-text': '#ffffff'
        },
        'dark': {
          'primary': '#579dff',
          'secondry': '#85b8ff',
          'background': '#1d2125',
          'background-secondry': '#1f2937',
          'navbar': '#1d2125',
          'border': '#333c43',
          'text': '#9fadbc',
          'secondry-button': '#9ca3af',
          'main-text': '#b6c2cf',
          'list': '#101204',
          'list-action-hover': '#282f27',
          'card': '#22272b'
        },
      }
    }
  },
  plugins: [
    require('flowbite/plugin')
  ],
}