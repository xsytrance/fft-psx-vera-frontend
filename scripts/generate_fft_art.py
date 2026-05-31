#!/usr/bin/env python3
"""
Generate FFT-styled SVG character portraits and background art for IvaliceVera.
Creates minimalist SVG avatars inspired by FFT's character portrait style.
"""

import os

OUT_DIR = "/home/xsyvps/projects/multivera-frontend/public"
CHAR_DIR = os.path.join(OUT_DIR, "characters")
BG_DIR = os.path.join(OUT_DIR, "backgrounds")

os.makedirs(CHAR_DIR, exist_ok=True)
os.makedirs(BG_DIR, exist_ok=True)

# ── FFT Character Portraits (SVG) ─────────────────────────────────────────
# Each is a stylized portrait frame inspired by FFT's character select screen
# Colors match each character's thematic identity

def make_character_svg(name, id_num, primary_color, secondary_color, accent_color, symbol, bg_gradient_1, bg_gradient_2):
    """Generate a character portrait SVG with FFT-styled frame."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg{id_num}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{bg_gradient_1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{bg_gradient_2};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="frame{id_num}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{primary_color};stop-opacity:1" />
      <stop offset="50%" style="stop-color:{secondary_color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{primary_color};stop-opacity:1" />
    </linearGradient>
    <radialGradient id="glow{id_num}" cx="50%" cy="40%" r="50%">
      <stop offset="0%" style="stop-color:{accent_color};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:{accent_color};stop-opacity:0" />
    </radialGradient>
    <clipPath id="portraitClip{id_num}">
      <rect x="20" y="15" width="160" height="170" rx="8" />
    </clipPath>
  </defs>

  <!-- Outer frame -->
  <rect x="4" y="4" width="192" height="192" rx="12" fill="url(#frame{id_num})" />
  <rect x="8" y="8" width="184" height="184" rx="10" fill="url(#bg{id_num})" />

  <!-- Inner decorative frame -->
  <rect x="14" y="12" width="172" height="176" rx="8" fill="none" stroke="{primary_color}" stroke-width="1.5" opacity="0.5" />

  <!-- Radial glow -->
  <rect x="20" y="15" width="160" height="170" rx="8" fill="url(#glow{id_num})" />

  <!-- Character silhouette / icon area -->
  <g clip-path="url(#portraitClip{id_num})">
    <!-- Background pattern -->
    <rect x="20" y="15" width="160" height="170" fill="url(#bg{id_num})" />

    <!-- Decorative lines -->
    <line x1="20" y1="45" x2="180" y2="45" stroke="{primary_color}" stroke-width="0.5" opacity="0.3" />
    <line x1="20" y1="155" x2="180" y2="155" stroke="{primary_color}" stroke-width="0.5" opacity="0.3" />

    <!-- Symbol / Crest -->
    <text x="100" y="100" text-anchor="middle" font-size="48" fill="{primary_color}" opacity="0.8" font-family="serif">{symbol}</text>

    <!-- Character name -->
    <text x="100" y="140" text-anchor="middle" font-size="14" fill="{primary_color}" font-family="serif" font-weight="bold" opacity="0.9">{name}</text>

    <!-- Decorative corner accents -->
    <path d="M20 35 L20 25 L30 25" fill="none" stroke="{accent_color}" stroke-width="1.5" opacity="0.6" />
    <path d="M180 35 L180 25 L170 25" fill="none" stroke="{accent_color}" stroke-width="1.5" opacity="0.6" />
    <path d="M20 165 L20 175 L30 175" fill="none" stroke="{accent_color}" stroke-width="1.5" opacity="0.6" />
    <path d="M180 165 L180 175 L170 175" fill="none" stroke="{accent_color}" stroke-width="1.5" opacity="0.6" />
  </g>

  <!-- Bottom label bar -->
  <rect x="20" y="158" width="160" height="24" rx="4" fill="{primary_color}" opacity="0.15" />
</svg>'''

# ── Character definitions ─────────────────────────────────────────────────
characters = [
    # (filename, id, name, primary, secondary, accent, symbol, bg1, bg2)
    ("ramza.svg", 1, "Ramza", "#B8960C", "#D4B85C", "#E8D070", "#0D1A35", "#1A2848"),
    ("delita.svg", 2, "Delita", "#8B1A1A", "#C04040", "#E06060", "#1A1010", "#2A1515"),
    ("agrias.svg", 3, "Agrias", "#1A3A7A", "#4A7AD0", "#6A9AF0", "#0D1829", "#142840"),
    ("mustadio.svg", 4, "Mustadio", "#8B6914", "#C89830", "#E0B040", "#1A1510", "#2A2018"),
    ("rapha.svg", 5, "Rapha", "#5B2D8B", "#8B5FC0", "#AB7FE0", "#150D25", "#201535"),
    ("marach.svg", 6, "Marach", "#6B1010", "#A03030", "#C05050", "#200808", "#301010"),
    ("alma.svg", 7, "Alma", "#4A7A9B", "#7AB0D0", "#9AD0F0", "#0D1A25", "#152835"),
    ("wiegraf.svg", 8, "Wiegraf", "#4A1A6B", "#7A4AA0", "#9A6AC0", "#120820", "#1A1030"),
    ("dycedarg.svg", 9, "Dycedarg", "#2A5A2A", "#4A8A4A", "#6AAA6A", "#0A1A0A", "#122512"),
    ("larg.svg", 10, "Larg", "#7A1A1A", "#B04040", "#D06060", "#1A0808", "#2A1010"),
    ("goffard.svg", 11, "Goffard", "#4A4A5A", "#7A7A8A", "#9A9AAA", "#12121A", "#1A1A25"),
    ("elmdore.svg", 12, "Elmdore", "#C8A020", "#E0C040", "#F0D060", "#1A1508", "#2A2010"),
    ("meliadoul.svg", 13, "Meliadoul", "#6A7A8A", "#9AADBD", "#BACDE0", "#10151A", "#182028"),
    ("orran.svg", 14, "Orran", "#1A1A4A", "#3A3A8A", "#5A5AAA", "#080818", "#101028"),
]

# Generate symbols (runes/letters for each character)
symbols = ["R", "D", "A", "M", "Ra", "Ma", "Al", "W", "Dy", "L", "G", "E", "Me", "O"]

for i, (filename, id_num, name, primary, secondary, accent, bg1, bg2) in enumerate(characters):
    svg = make_character_svg(name, id_num, primary, secondary, accent, symbols[i], bg1, bg2)
    filepath = os.path.join(CHAR_DIR, filename)
    with open(filepath, 'w') as f:
        f.write(svg)
    print(f"✓ {filename}")

# ── Generate a Zodiac Stone / Auracite gem SVG ────────────────────────────
def make_zodiac_gem(name, color, glow_color):
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <radialGradient id="gem" cx="40%" cy="35%" r="60%">
      <stop offset="0%" style="stop-color:{glow_color};stop-opacity:0.9" />
      <stop offset="60%" style="stop-color:{color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{color};stop-opacity:0.7" />
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <polygon points="32,4 56,24 48,56 16,56 8,24" fill="url(#gem)" stroke="{glow_color}" stroke-width="0.5" opacity="0.8" filter="url(#glow)"/>
  <polygon points="32,4 44,24 32,20 20,24" fill="{glow_color}" opacity="0.3"/>
  <text x="32" y="40" text-anchor="middle" font-size="10" fill="{glow_color}" font-family="serif" opacity="0.8">{name[0]}</text>
</svg>'''

zodiac_gems = [
    ("belias.svg", "#CC4400", "#FF8844"),
    ("hashmal.svg", "#448833", "#88CC66"),
    ("cuchulainn.svg", "#CCAA22", "#FFDD66"),
    ("mateus.svg", "#3366AA", "#6699DD"),
    ("adrammelech.svg", "#CCCC44", "#FFFF88"),
    ("zeromus.svg", "#663399", "#9966CC"),
]

for filename, color, glow in zodiac_gems:
    name = filename.replace('.svg', '')
    svg = make_zodiac_gem(name.capitalize(), color, glow)
    with open(os.path.join(CHAR_DIR, filename), 'w') as f:
        f.write(svg)
    print(f"✓ {filename}")

# ── Generate Ivalice map background pattern (SVG) ─────────────────────────
ivalice_bg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#0A0E1A;stop-opacity:1" />
      <stop offset="40%" style="stop-color:#141C30;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1A2848;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="moon" cx="75%" cy="15%" r="8%">
      <stop offset="0%" style="stop-color:#E8D8B0;stop-opacity:0.9" />
      <stop offset="70%" style="stop-color:#C8A860;stop-opacity:0.4" />
      <stop offset="100%" style="stop-color:#C8A860;stop-opacity:0" />
    </radialGradient>
    <pattern id="stars" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="15" r="0.8" fill="#E8D8B0" opacity="0.4"/>
      <circle cx="50" cy="8" r="0.5" fill="#E8D8B0" opacity="0.3"/>
      <circle cx="90" cy="25" r="0.7" fill="#E8D8B0" opacity="0.5"/>
      <circle cx="130" cy="12" r="0.4" fill="#E8D8B0" opacity="0.3"/>
      <circle cx="170" cy="30" r="0.6" fill="#E8D8B0" opacity="0.4"/>
      <circle cx="30" cy="60" r="0.5" fill="#E8D8B0" opacity="0.3"/>
      <circle cx="70" cy="80" r="0.8" fill="#E8D8B0" opacity="0.5"/>
      <circle cx="110" cy="70" r="0.4" fill="#E8D8B0" opacity="0.2"/>
      <circle cx="150" cy="90" r="0.6" fill="#E8D8B0" opacity="0.4"/>
      <circle cx="190" cy="55" r="0.7" fill="#E8D8B0" opacity="0.3"/>
      <circle cx="20" cy="120" r="0.5" fill="#E8D8B0" opacity="0.3"/>
      <circle cx="60" cy="140" r="0.7" fill="#E8D8B0" opacity="0.4"/>
      <circle cx="100" cy="110" r="0.4" fill="#E8D8B0" opacity="0.2"/>
      <circle cx="140" cy="150" r="0.6" fill="#E8D8B0" opacity="0.5"/>
      <circle cx="180" cy="130" r="0.5" fill="#E8D8B0" opacity="0.3"/>
    </pattern>
  </defs>

  <!-- Sky background -->
  <rect width="1920" height="1080" fill="url(#sky)"/>

  <!-- Stars -->
  <rect width="1920" height="600" fill="url(#stars)" opacity="0.6"/>

  <!-- Moon -->
  <circle cx="1440" cy="160" r="70" fill="url(#moon)"/>
  <circle cx="1440" cy="160" r="35" fill="#E8D8B0" opacity="0.7"/>

  <!-- Zodiac circle (faint, in sky) -->
  <circle cx="960" cy="300" r="120" fill="none" stroke="#C8A84E" stroke-width="0.5" opacity="0.15"/>
  <circle cx="960" cy="300" r="100" fill="none" stroke="#C8A84E" stroke-width="0.3" opacity="0.1"/>

  <!-- Mountain silhouettes -->
  <path d="M0 800 L200 550 L400 650 L600 500 L800 620 L1000 480 L1200 600 L1400 520 L1600 580 L1800 500 L1920 600 L1920 1080 L0 1080 Z" fill="#0D1520" opacity="0.8"/>
  <path d="M0 850 L150 700 L350 780 L550 680 L750 750 L950 650 L1150 730 L1350 670 L1550 720 L1750 660 L1920 720 L1920 1080 L0 1080 Z" fill="#0A1018" opacity="0.9"/>

  <!-- Castle silhouette -->
  <path d="M820 620 L820 520 L830 520 L830 480 L840 480 L840 520 L860 520 L860 500 L870 500 L870 520 L890 520 L890 480 L900 480 L900 520 L920 520 L920 500 L930 500 L930 520 L950 520 L950 480 L960 480 L960 520 L980 520 L980 500 L990 500 L990 520 L1010 520 L1010 480 L1020 480 L1020 520 L1030 520 L1030 620 Z" fill="#080E16" opacity="0.85"/>

  <!-- Ground -->
  <rect x="0" y="850" width="1920" height="230" fill="#0A1018"/>

  <!-- Subtle grid lines (FFT map style) -->
  <line x1="0" y1="900" x2="1920" y2="900" stroke="#C8A84E" stroke-width="0.3" opacity="0.05"/>
  <line x1="0" y1="950" x2="1920" y2="950" stroke="#C8A84E" stroke-width="0.3" opacity="0.05"/>
  <line x1="0" y1="1000" x2="1920" y2="1000" stroke="#C8A84E" stroke-width="0.3" opacity="0.05"/>
  <line x1="480" y1="850" x2="480" y2="1080" stroke="#C8A84E" stroke-width="0.3" opacity="0.05"/>
  <line x1="960" y1="850" x2="960" y2="1080" stroke="#C8A84E" stroke-width="0.3" opacity="0.05"/>
  <line x1="1440" y1="850" x2="1440" y2="1080" stroke="#C8A84E" stroke-width="0.3" opacity="0.05"/>

  <!-- Title text -->
  <text x="960" y="980" text-anchor="middle" font-family="serif" font-size="16" fill="#C8A84E" opacity="0.12" letter-spacing="8">IVALICE — THE WAR OF THE LIONS</text>
</svg>'''

with open(os.path.join(BG_DIR, "ivalice-night.svg"), 'w') as f:
    f.write(ivalice_bg)
print("✓ ivalice-night.svg")

# ── Generate a subtle parchment texture pattern ────────────────────────────
parchment_pattern = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" preserveAspectRatio="xMidYMid slice">
  <rect width="256" height="256" fill="#F5EDE0"/>
  <!-- Noise texture simulation -->
  <rect width="256" height="256" fill="url(#paper)" opacity="0.03"/>
  <defs>
    <filter id="paper">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
    </filter>
  </defs>
  <rect width="256" height="256" filter="url(#paper)" opacity="0.015"/>
</svg>'''

with open(os.path.join(BG_DIR, "parchment.svg"), 'w') as f:
    f.write(parchment_pattern)
print("✓ parchment.svg")

print(f"\n✅ All assets generated in {OUT_DIR}/")
