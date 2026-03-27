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
        cormorant: ['var(--font-cormorant)', 'serif'],
        dm: ['var(--font-dm)', 'sans-serif'],
      },
      colors: {
        mthr: {
          white:  '#FFFFFF',
          off:    '#F5F2EE',
          bg:     '#EDE9E3',
          b1:     '#E8E4DE',
          b2:     '#D0CCC6',
          mid:    '#8A8680',
          dim:    '#C0BCB6',
          dark:   '#2A2620',
          black:  '#1A1814',
        },
      },
    },
  },
  plugins: [],
}
export default config
