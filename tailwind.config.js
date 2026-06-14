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

        // ── Retuned literal scales → the "Aetherium War-Ledger" identity.
        //    The Inventory/Campfire pages use these scale names directly, so
        //    retuning them shifts the whole palette without touching JSX. ─────

        // amber → antique bronze / gold (ledgers, primary records)
        amber: {
          50: "#fbf4e3", 100: "#f3e6c4", 200: "#e9d59b", 300: "#ddc074",
          400: "#d0a94f", 500: "#c9a24b", 600: "#b08537", 700: "#8a6d2e",
          800: "#5f4a20", 900: "#3d3015", 950: "#221a0b",
        },
        // slate → obsidian / moonlit slate (surfaces, frames)
        slate: {
          50: "#eef1f6", 100: "#dde2ec", 200: "#c0c7d6", 300: "#9aa3b4",
          400: "#6f7a8e", 500: "#515b6e", 600: "#3b4458", 700: "#2a3346",
          800: "#1b2233", 900: "#141925", 950: "#0b0f18",
        },
        // emerald → aether teal (memory / parser-verified)
        emerald: {
          50: "#e2fbf6", 100: "#c2f3ea", 200: "#93e7da", 300: "#5fd6c7",
          400: "#3cc2b4", 500: "#25a99c", 600: "#1d8a80", 700: "#1a6f68",
          800: "#134f4b", 900: "#0e3331", 950: "#07201f",
        },
        // orange → ember (campfire / character warmth)
        orange: {
          50: "#fdeee4", 100: "#fbd9c3", 200: "#f7b793", 300: "#f3976a",
          400: "#ef7d49", 500: "#e8743b", 600: "#c75a26", 700: "#a8501f",
          800: "#6e3414", 900: "#45200c", 950: "#281206",
        },
        // purple → arcane amethyst (the LLM / spellbound layer)
        purple: {
          50: "#f1ecfa", 100: "#e0d4f3", 200: "#c8b3e8", 300: "#ad8fdb",
          400: "#9a7bd1", 500: "#855fc2", 600: "#6f48ad", 700: "#5b3b8f",
          800: "#412a64", 900: "#2a1b42", 950: "#190f29",
        },
        // blue → muted steel (equipment cross-references)
        blue: {
          50: "#ecf1fb", 100: "#d3def4", 200: "#b0c3e8", 300: "#8aa3d6",
          400: "#6f8fd6", 500: "#5274bf", 600: "#3f5ca0", 700: "#324a80",
          800: "#243355", 900: "#1a2540", 950: "#101728",
        },
        // red → burgundy (danger)
        red: {
          50: "#fbeae9", 100: "#f6cecb", 200: "#eda6a1", 300: "#e07c74",
          400: "#e0564f", 500: "#cf4039", 600: "#b0312c", 700: "#8c2723",
          800: "#5e1a17", 900: "#3b110f", 950: "#220908",
        },
        // yellow → caution gold (warnings)
        yellow: {
          50: "#fbf6e3", 100: "#f7ecc2", 200: "#efd98f", 300: "#e6c45f",
          400: "#dcb13f", 500: "#cda032", 600: "#a98129", 700: "#836322",
          800: "#574016", 900: "#38290e", 950: "#201706",
        },
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
