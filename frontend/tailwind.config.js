/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backdropBlur: {
        '68': '68px',
      },
      colors: {
        "rich-black-900": "#000814",
        "rich-black-800" : "#161D29",
        "rich-black-700" : "#2C333F",
        "rich-black-600" : "#424854",
        "rich-black-400" : "#6E727F",
        "rich-Black-300": "#838894",
        "rich-black-200" : "#999DAA",
        "rich-black-100" : "#AFB2BF",
        "rich-black-5": "#F1F2FF",
        "yellow-50": "#FFD60A",
        "pure-greys-5": "#F9F9F9",
        "greenish": "#014A32",
        "greenish-300": "#05A77B",
        "greenish-500": "#037957",
        
      },
      backgroundImage: {
        "gradient-05": "linear-gradient(118.19deg, #1FA2FF -3.62%, #12D8FA 50.44%, #A6FFCB 104.51%)",
        'gradient-custom': 'linear-gradient(111.93deg, rgba(14, 26, 45, 0.24) -1.4%, rgba(17, 30, 50, 0.38) 104.96%)',
        'gradient-code': 'linear-gradient(123.77deg, #8A2BE2 -6.46%, #FFA500 59.04%, #F8F8FF 124.53%)',
        'gradient-blue': 'linear-gradient(117.82deg, #9CECFB -9.12%, #65C7F7 48.59%, #0052D4 106.3%)',
        "gradient-06" : 'linear-gradient(117.83deg, #FF512F -4.8%, #F09819 107.46%)',
        "gradient-08": 'linear-gradient(118.41deg, #E65C00 -6.05%, #F9D423 106.11%)'
      },
      boxShadow: {
        'card-shadow': '8px 8px 0px 0px #FFD60A',
        'white-inset': 'inset -2px -2px 0px 0px #FFFFFF2E',
        'inner-light': 'inset -2px -2px 0px 0px #FFFFFF82',
        'shadow-custom': '15px 15px 0px 0px #F5F5F5',
        "custom-left": "-20px -20px 0px 0px #FFFFFF",
      },
      fontFamily: {
        edu: ['"Edu SA Beginner"', 'cursive'], // add your Google font
      },
    },
  },
  plugins: [],
};
