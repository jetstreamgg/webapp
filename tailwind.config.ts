import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './node_modules/@jetstreamgg/widgets/**/*.js'
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem'
    },
    extend: {
      fontFamily: {
        graphik: ['GraphikStd'],
        circle: ['CircleStd'],
        sans: ['GraphikStd'] //default font. see https://tailwindcss.com/docs/font-family#customizing-the-default-font
      },
      colors: {
        // Typographic colors
        text: 'var(--primary-white)',
        textSecondary: 'rgba(198, 194, 255, 0.8)',
        bullish: 'var(--service-green)',
        textEmphasis: 'var(--primary-pink)',
        textMuted: 'rgba(198, 194, 255, 0.8)',
        error: 'var(--service-red)',
        textDimmed: 'rgb(120,116,208)',
        textDesaturated: 'rgb(186,182,250)',

        // Background colors
        container: 'var(--transparent-black-65)',
        containerDark: 'var(--transparent-black-85)',
        surface: 'rgba(108, 104, 255, 0.3)',
        surfaceHover: 'rgba(68, 45, 125, 0.202)',
        surfaceAlt: 'var(--transparent-white-20)',
        panel: 'var(--transparent-black-20)',
        selectBackground: 'var(--transparent-white-25)',
        selectActive: 'var(--transparent-white-40)',

        // Button colors,
        primary: 'transparent',
        primaryHover: 'transparent',
        primaryActive: 'transparent',
        primaryFocus: 'transparent',
        primaryDisabled: 'transparent',

        secondary: 'var(--transparent-black-20)',
        secondaryHover: 'var(--transparent-black-20)',
        secondaryActive: 'var(--transparent-black-20)',
        secondaryFocus: 'var(--transparent-black-20)',
        secondaryDisabled: 'var(--transparent-black-20)',

        tab: 'var(--transparent-white-70)',
        tabPrimary: 'var(--transparent-white-40)',

        card: 'rgba(128, 117, 255, 0.07)',
        'card-light': 'rgba(64, 60, 113, 0.207)',
        border: 'var(--transparent-white-15)',
        borderActive: '--transparent-white-25',
        borderPurple: '#4c4577',

        brand: 'rgb(var(--brand-purple) / <alpha-value>)',
        brandLight: 'rgb(var(--brand-light-purple) / <alpha-value>)',
        brandDark: 'rgb(var(--brand-dark-purple) / <alpha-value>)',
        brandMiddle: 'rgb(var(--brand-middle-purple) / <alpha-value>)',

        // TODO: keep these until we delete the @apply rules in globals.css
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        chartSelect: 'rgba(22, 17, 53, 1)'
      },
      fontWeight: {
        'custom-450': '450'
      },
      backgroundImage: {
        // TODO: All button states need to either be in 'colors' or 'backgroundImage', or they will overlap. To use gradients, they must be in 'backgroundImage'
        primary:
          'radial-gradient(116.48% 116.48% at 50% 2.27%, rgba(61, 47, 164, var(--gradient-opacity)) 0%,rgba(76, 61, 183, var(--gradient-opacity)) 100%)',
        primaryBright:
          'radial-gradient(116.48% 116.48% at 50% 2.27%, rgba(87, 59, 246, var(--gradient-opacity)) 0%,rgba(102, 72, 246, var(--gradient-opacity)) 100%)',
        primaryHover: 'var(--service-purple-15)',
        primaryDisabled: 'var(--service-purple-0)',
        primaryActive: 'var(--service-purple-5)',
        primaryFocus: 'var(--primary-purple-40)',
        primaryTransparent: 'var(--service-purple-transparent)',
        'app-background': 'url(/images/background.png)',
        'blend-overlay': 'overlay',
        'blend-plus-lighter': 'plus-lighter',
        'sky-blue': 'url(/images/sky-blue.png)',
        'sky-purple': 'url(/images/sky-purple.png)',
        'sky-pink': 'url(/images/sky-pink.png)',
        'sky-purplish-blue': 'url(/images/sky-purplish-blue.png)',
        'nav-light': 'var(--service-nav-light)'
      },
      borderRadius: {
        lg: '10px',
        md: '8px',
        sm: '6px'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'slide-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-collapsible-content-height)'
          }
        },
        'slide-up': {
          from: {
            height: 'var(--radix-collapsible-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-down': 'slide-down 0.2s ease-out',
        'slide-up': 'slide-up 0.2s ease-out'
      },
      maxHeight: {
        'screen-70': 'calc(100vh - 70px)'
      },
      screens: {
        // sm - xl are tailwind defaults, adding for reference
        // overriding lg from 1024px to 912px
        // 'sm': '640px',
        // 'md': '768px',
        lg: '912px',
        // 'xl': '1280px',
        '2xl': '1400px',
        '3xl': '1680px'
      },
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.7, 0.0, 0.84, 0.0)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.03, 1)',
        'in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
        'bezier-mouse': 'cubic-bezier(0.4, 0.0, 0.2, 1)'
      },
      transitionDuration: {
        250: '250ms',
        350: '350ms'
      },
      transitionProperty: {
        'gradient-opacity': '--gradient-opacity',
        'gradient-and-colors':
          '--gradient-opacity, color, background-color, border-color, text-decoration-color, fill, stroke'
      }
    }
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/container-queries')]
} satisfies Config;
