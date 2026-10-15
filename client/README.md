# The Match Mirror — Smart Beauty & Foundation Shade Matcher Prototype

> **FYP Frontend Prototype**: Personalized foundation shade matching and skin tone/undertone discovery designed specifically for Pakistani complexions, climate, and products.

---

## 🎨 Theme & Design System Customization

As requested, all colors, corner radius, borders, and shadows are centralized in a single configuration file so you can easily modify the entire site at any time:

### Central Theme File:
📁 [`src/constants/theme.js`](file:///c:/Users/ABC/Desktop/irha%20fyp/client/src/constants/theme.js)

```javascript
export const COLORS = {
  bgMain: '#0B0B0D',       // Main dark background
  bgSecondary: '#121216',  // Secondary background
  bgCard: '#18181D',       // Card background
  bgElevated: '#202027',   // Elevated surfaces
  textPrimary: '#F5F5F5',  // High contrast white
  textSecondary: '#A1A1AA',// Neutral secondary
  textMuted: '#71717A',    // Muted grey
  border: '#2B2B33',       // Borders
  accentPrimary: '#E879A9',// Soft rose pink
  accentSecondary: '#C4B5FD', // Soft lavender
  success: '#86EFAC',
  warning: '#FCD34D',
  error: '#FCA5A5',
};

export const RADIUS = {
  default: '5px',          // Strict 5px rule across entire app
  card: '5px',
  button: '5px',
  input: '5px',
  modal: '5px',
  full: '9999px',          // Strictly for circular swatches/avatars
};
```

These values are also mirrored as CSS variables in [`src/index.css`](file:///c:/Users/ABC/Desktop/irha%20fyp/client/src/index.css) and registered in [`tailwind.config.js`](file:///c:/Users/ABC/Desktop/irha%20fyp/client/tailwind.config.js).

---

## 🚀 How to Run the Project Locally

Inside `c:\Users\ABC\Desktop\irha fyp\client`:

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start the development server
npm run dev

# 3. Test production build
npm run build
```

The application runs at **`http://localhost:5173/`**.

---

## 📱 Implemented Features & Architecture

1. **Phase A — Home / Landing Page (`/`)**:
   - Hero Slider with "Your Shade. Your Match.", CTAs, spectrum preview, controls.
   - Core Feature Cards (Undertone detection, Monk scale, Pakistani brands in PKR, Blending guide).
   - "How It Works" 4-step interactive breakdown.
   - Pakistani beauty special focus section (addressing why Western apps fail Desi skin).
   - Featured foundation swatches preview.

2. **Phase B — Skin Analysis Demo (`/analysis`)**:
   - Simulated camera framing viewport with lighting sensors & facial reticle.
   - Persona switcher (Wheatish Warm, Fair Neutral, Olive Tan, Deep Bronze).
   - Interactive 6-step spectral scan animation.
   - Diagnostic results card: Detected tone, Undertone, Monk Skin Tone (MST 1-10), Confidence Score, Climate Wear advice.
   - Monk Scale Guide modal.
   - Direct CTA to view matches.

3. **Phase C — Foundation Finder (`/shades`)**:
   - Product catalog with Pakistani (Masarrat Misbah, Rivaj UK, Kashee's) & global favorites (Maybelline, L'Oréal, Huda Beauty).
   - Live search by product, brand, or shade.
   - Multi-faceted filters (Brand, Undertone, Skin Tone, Budget slider in PKR, Sort by price/rating).
   - Mobile slide-up filter drawer.
   - Product Details Modal with "Why this shade?" rationale.
   - Bookmark / Save shade toggle.

4. **Phase D — Blending Guide (`/blending`)**:
   - Interactive SVG face zone map (Forehead, Under-eye, Cheeks, Chin/Perioral, Jawline/Neck).
   - Step-by-step application walkthrough (5 steps) with Prev/Next and Reset controls.
   - Simulated coverage density heatmap meter.
   - Desi climate humidity lock tips.

5. **Phase E — Profile & Saved Collection (`/profile`)**:
   - Demo user profile dashboard (Fatima Zahra, Lahore).
   - Saved foundation shades collection.
   - Recent diagnostic scans history log.
   - Customizable skin type, climate region, and Pakistani brand priority preferences.
   - Reset prototype data modal.

---

## 🔒 Design Directives Verified
- ✅ **Strict 5px corner radius** on cards, buttons, modals, dropdowns, navigation.
- ✅ **Zero gold** styling anywhere.
- ✅ **Zero gradients** anywhere.
- ✅ **Solid dark color palette**.
- ✅ **Mobile-first app-like experience** with 4 fixed bottom tabs.
