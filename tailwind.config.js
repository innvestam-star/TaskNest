/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B0518',    // Deepest violet/black background
          surface: '#150E26', // Card background
          surfaceHighlight: '#1F1638', // Hover/Active card
          primary: '#7C3AED', // Electric Violet (Main action)
          primaryHover: '#6D28D9',
          accent: '#22D3EE',  // Electric Cyan (Secondary action/highlight)
          success: '#10B981', // Emerald
          warning: '#F59E0B', // Amber
          error: '#EF4444',   // Red
          text: {
            primary: '#F8FAFC', // Slate 50
            secondary: '#94A3B8', // Slate 400
            muted: '#64748B', // Slate 500
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 15px rgba(124, 58, 237, 0.3)',
        'glow-accent': '0 0 15px rgba(34, 211, 238, 0.3)',
      }
    },
  },
  plugins: [],
}
