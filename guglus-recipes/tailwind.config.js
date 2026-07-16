/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  // Support both class-based and data-attribute dark mode
  darkMode: ['class', '[data-theme="dark"]'],
  
  // Future-proof for Tailwind v4
  future: {
    hoverOnlyWhenSupported: true,
    respectDefaultRingColorOpacity: true,
  },
  
  theme: {
    // ─── Custom Breakpoints (mobile-first, fine-tuned) ─────────────────────
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },

    extend: {
      // ─── Colors (your palette + semantic tokens) ──────────────────────────
      colors: {
        // Light Mode
        primary: {
          DEFAULT: '#E07A5F',
          hover: '#C96A50',
          light: '#F4A896',
          dark: '#B85E45',
        },
        background: '#FEFAE0',
        card: '#FFFFFF',
        'text-primary': '#2D3436',
        'text-secondary': '#636E72',
        border: '#E8E8E8',
        success: '#81B29A',
        
        // Semantic tokens
        error: {
          DEFAULT: '#E07A5F',
          light: '#FADBD8',
          dark: '#C0392B',
        },
        warning: {
          DEFAULT: '#F2CC8F',
          light: '#FCF3CF',
          dark: '#D4A96A',
        },
        info: {
          DEFAULT: '#81B29A',
          light: '#D5F5E3',
          dark: '#27AE60',
        },

        // Dark Mode tokens
        dark: {
          primary: '#F2CC8F',
          'primary-hover': '#D4A96A',
          background: '#1A1A2E',
          card: '#16213E',
          'text-primary': '#EAEAEA',
          'text-secondary': '#A0A0A0',
          border: '#2A2A4A',
        }
      },

      // ─── Font Family ──────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },

      // ─── Fluid Typography (responsive without media queries) ──────────────
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.35vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.65vw, 1.5rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 2rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.2rem + 1.5vw, 3rem)',
      },

      // ─── Spacing (safe areas + extended scale) ──────────────────────────
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        '18': '4.5rem',
        '22': '5.5rem',
      },

      // ─── Z-Index Scale (semantic, prevents random values) ─────────────────
      zIndex: {
        'behind': '-1',
        'dropdown': '100',
        'sticky': '200',
        'header': '300',
        'modal-backdrop': '400',
        'modal': '500',
        'popover': '600',
        'toast': '700',
        'tooltip': '800',
      },

      // ─── Shadows (elevation system) ───────────────────────────────────────
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'elevated': '0 10px 25px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.08)',
        'float': '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
      },

      // ─── Border Radius (consistent rounding) ──────────────────────────────
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      // ─── Aspect Ratios (for recipe images) ───────────────────────────────
      aspectRatio: {
        'recipe': '4 / 3',
        'recipe-wide': '16 / 9',
        'recipe-square': '1 / 1',
        'hero': '21 / 9',
      },

      // ─── Transitions ──────────────────────────────────────────────────────
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },

      // ─── Animations ───────────────────────────────────────────────────────
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'spin-slow': 'spin 2s linear infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'slide-out-right': 'slideOutRight 0.2s ease-in forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideOutRight: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(20px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },

      // ─── Scroll Padding (for sticky headers) ──────────────────────────────
      scrollPadding: {
        'header': '5rem',
        'header-mobile': '7rem',
      },

      // ─── Cursor ───────────────────────────────────────────────────────────
      cursor: {
        'grab': 'grab',
        'grabbing': 'grabbing',
      },

      // ─── Ring Width (focus states) ────────────────────────────────────────
      ringWidth: {
        '3': '3px',
      },
      ringOffsetWidth: {
        '3': '3px',
      },
    },
  },

  // ─── Plugins ──────────────────────────────────────────────────────────────
  plugins: [
    // Safe area padding utilities
    function({ addUtilities }) {
      addUtilities({
        '.p-safe': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingRight: 'env(safe-area-inset-right)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.px-safe': {
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.py-safe': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.pt-safe': { paddingTop: 'env(safe-area-inset-top)' },
        '.pb-safe': { paddingBottom: 'env(safe-area-inset-bottom)' },
        '.pl-safe': { paddingLeft: 'env(safe-area-inset-left)' },
        '.pr-safe': { paddingRight: 'env(safe-area-inset-right)' },
        '.min-h-dscreen': { minHeight: '100dvh' },
        '.min-h-screen-safe': { minHeight: 'calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))' },
        '.touch-manipulation': { touchAction: 'manipulation' },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        '.text-balance': { textWrap: 'balance' },
        '.text-pretty': { textWrap: 'pretty' },
        '.content-visibility-auto': { contentVisibility: 'auto' },
        '.gpu': { transform: 'translateZ(0)' },
        '.will-change-transform': { willChange: 'transform' },
        '.tap-highlight-transparent': { '-webkit-tap-highlight-color': 'transparent' },
      })
    },
  ],
}