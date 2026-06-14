/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ["Cinzel", "Crimson Text", "Georgia", "serif"],
        serif: ["Crimson Text", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        // ── Semantic tokens (resolve to the obsidian/bronze palette) ──────────
        border: "hsl(var(--border-token))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        // ── Literal scales, now CSS-variable-driven so they flip between the
        //    Obsidian (dark) and Parchment (light) themes. The dark values are
        //    byte-identical to the previous ramps; light values live in App.css. ─
        amber: { 50: "rgb(var(--c-amber-50) / <alpha-value>)", 100: "rgb(var(--c-amber-100) / <alpha-value>)", 200: "rgb(var(--c-amber-200) / <alpha-value>)", 300: "rgb(var(--c-amber-300) / <alpha-value>)", 400: "rgb(var(--c-amber-400) / <alpha-value>)", 500: "rgb(var(--c-amber-500) / <alpha-value>)", 600: "rgb(var(--c-amber-600) / <alpha-value>)", 700: "rgb(var(--c-amber-700) / <alpha-value>)", 800: "rgb(var(--c-amber-800) / <alpha-value>)", 900: "rgb(var(--c-amber-900) / <alpha-value>)", 950: "rgb(var(--c-amber-950) / <alpha-value>)" },
        slate: { 50: "rgb(var(--c-slate-50) / <alpha-value>)", 100: "rgb(var(--c-slate-100) / <alpha-value>)", 200: "rgb(var(--c-slate-200) / <alpha-value>)", 300: "rgb(var(--c-slate-300) / <alpha-value>)", 400: "rgb(var(--c-slate-400) / <alpha-value>)", 500: "rgb(var(--c-slate-500) / <alpha-value>)", 600: "rgb(var(--c-slate-600) / <alpha-value>)", 700: "rgb(var(--c-slate-700) / <alpha-value>)", 800: "rgb(var(--c-slate-800) / <alpha-value>)", 900: "rgb(var(--c-slate-900) / <alpha-value>)", 950: "rgb(var(--c-slate-950) / <alpha-value>)" },
        emerald: { 50: "rgb(var(--c-emerald-50) / <alpha-value>)", 100: "rgb(var(--c-emerald-100) / <alpha-value>)", 200: "rgb(var(--c-emerald-200) / <alpha-value>)", 300: "rgb(var(--c-emerald-300) / <alpha-value>)", 400: "rgb(var(--c-emerald-400) / <alpha-value>)", 500: "rgb(var(--c-emerald-500) / <alpha-value>)", 600: "rgb(var(--c-emerald-600) / <alpha-value>)", 700: "rgb(var(--c-emerald-700) / <alpha-value>)", 800: "rgb(var(--c-emerald-800) / <alpha-value>)", 900: "rgb(var(--c-emerald-900) / <alpha-value>)", 950: "rgb(var(--c-emerald-950) / <alpha-value>)" },
        orange: { 50: "rgb(var(--c-orange-50) / <alpha-value>)", 100: "rgb(var(--c-orange-100) / <alpha-value>)", 200: "rgb(var(--c-orange-200) / <alpha-value>)", 300: "rgb(var(--c-orange-300) / <alpha-value>)", 400: "rgb(var(--c-orange-400) / <alpha-value>)", 500: "rgb(var(--c-orange-500) / <alpha-value>)", 600: "rgb(var(--c-orange-600) / <alpha-value>)", 700: "rgb(var(--c-orange-700) / <alpha-value>)", 800: "rgb(var(--c-orange-800) / <alpha-value>)", 900: "rgb(var(--c-orange-900) / <alpha-value>)", 950: "rgb(var(--c-orange-950) / <alpha-value>)" },
        purple: { 50: "rgb(var(--c-purple-50) / <alpha-value>)", 100: "rgb(var(--c-purple-100) / <alpha-value>)", 200: "rgb(var(--c-purple-200) / <alpha-value>)", 300: "rgb(var(--c-purple-300) / <alpha-value>)", 400: "rgb(var(--c-purple-400) / <alpha-value>)", 500: "rgb(var(--c-purple-500) / <alpha-value>)", 600: "rgb(var(--c-purple-600) / <alpha-value>)", 700: "rgb(var(--c-purple-700) / <alpha-value>)", 800: "rgb(var(--c-purple-800) / <alpha-value>)", 900: "rgb(var(--c-purple-900) / <alpha-value>)", 950: "rgb(var(--c-purple-950) / <alpha-value>)" },
        blue: { 50: "rgb(var(--c-blue-50) / <alpha-value>)", 100: "rgb(var(--c-blue-100) / <alpha-value>)", 200: "rgb(var(--c-blue-200) / <alpha-value>)", 300: "rgb(var(--c-blue-300) / <alpha-value>)", 400: "rgb(var(--c-blue-400) / <alpha-value>)", 500: "rgb(var(--c-blue-500) / <alpha-value>)", 600: "rgb(var(--c-blue-600) / <alpha-value>)", 700: "rgb(var(--c-blue-700) / <alpha-value>)", 800: "rgb(var(--c-blue-800) / <alpha-value>)", 900: "rgb(var(--c-blue-900) / <alpha-value>)", 950: "rgb(var(--c-blue-950) / <alpha-value>)" },
        red: { 50: "rgb(var(--c-red-50) / <alpha-value>)", 100: "rgb(var(--c-red-100) / <alpha-value>)", 200: "rgb(var(--c-red-200) / <alpha-value>)", 300: "rgb(var(--c-red-300) / <alpha-value>)", 400: "rgb(var(--c-red-400) / <alpha-value>)", 500: "rgb(var(--c-red-500) / <alpha-value>)", 600: "rgb(var(--c-red-600) / <alpha-value>)", 700: "rgb(var(--c-red-700) / <alpha-value>)", 800: "rgb(var(--c-red-800) / <alpha-value>)", 900: "rgb(var(--c-red-900) / <alpha-value>)", 950: "rgb(var(--c-red-950) / <alpha-value>)" },
        yellow: { 50: "rgb(var(--c-yellow-50) / <alpha-value>)", 100: "rgb(var(--c-yellow-100) / <alpha-value>)", 200: "rgb(var(--c-yellow-200) / <alpha-value>)", 300: "rgb(var(--c-yellow-300) / <alpha-value>)", 400: "rgb(var(--c-yellow-400) / <alpha-value>)", 500: "rgb(var(--c-yellow-500) / <alpha-value>)", 600: "rgb(var(--c-yellow-600) / <alpha-value>)", 700: "rgb(var(--c-yellow-700) / <alpha-value>)", 800: "rgb(var(--c-yellow-800) / <alpha-value>)", 900: "rgb(var(--c-yellow-900) / <alpha-value>)", 950: "rgb(var(--c-yellow-950) / <alpha-value>)" },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
