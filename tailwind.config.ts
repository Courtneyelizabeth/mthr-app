import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['var(--font-bebas)', 'sans-serif'],
        cormorant: ['var(--font-cormorant)', 'serif'],
        dm: ['var(--font-dm)', 'sans-serif'],
      },
      colors: {
        mthr: {
          white:  '#FAFAF8',
          off:    '#F2F0ED',
          b1:     '#E8E4DE',
          b2:     '#D0CCC6',
          mid:    '#888480',
          dim:    '#C0BCB6',
          dark:   '#2A2620',
          black:  '#0D0C0A',
        },
      },
      letterSpacing: {
        wider2: '0.14em',
        widest2: '0.2em',
      },
    },
  },
  plugins: [],
}
export default config
