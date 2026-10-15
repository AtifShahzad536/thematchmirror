# The Match Mirror — Project Implementation Plan

## Overview
**The Match Mirror** is a smart beauty web application prototype designed to assist users in identifying their skin tone, undertone, and ideal foundation shades, specifically tailored for Pakistani users and products.

Built with:
- React + Vite (JavaScript)
- Tailwind CSS (Solid dark aesthetic, zero gradients, zero gold)
- Framer Motion
- React Router DOM
- React Icons
- Context API & LocalStorage
- Modular Design Tokens & Theme System (`src/constants/theme.js`)

---

## Strict Design Directives
- **Color Palette (Solid Only)**:
  - Main Background: `#0B0B0D`
  - Secondary Background: `#121216`
  - Card Background: `#18181D`
  - Elevated Surface: `#202027`
  - Primary Text: `#F5F5F5`
  - Secondary Text: `#A1A1AA`
  - Muted Text: `#71717A`
  - Borders: `#2B2B33`
  - Primary Accent: `#E879A9` (Soft Rose Pink)
  - Secondary Accent: `#C4B5FD` (Soft Lavender)
  - Success: `#86EFAC`
  - Warning: `#FCD34D`
  - Error: `#FCA5A5`
- **Strictly Prohibited**:
  - No gold/golden colors anywhere (buttons, text, borders, icons).
  - No gradients anywhere (no CSS gradients, no gradient text/buttons/overlays).
  - No default purple-blue SaaS aesthetics.
  - No excessive glassmorphism or blur effects.
- **Corner Radius**:
  - Exactly **5px** for all cards, buttons, inputs, modals, dropdowns, images, and nav elements.
  - Circular shapes only for functional circles (swatches, indicator dots, user avatar).
- **Theme Variables**:
  - Centralized in `src/constants/theme.js` and CSS variables for single-source-of-truth customization.

---

## Phase Execution Checklist

- [x] **Phase 1: Project Setup & Design Foundation**
  - [x] Inspect workspace and initialize Vite React in `client/`
  - [x] Install dependencies (`react-router-dom`, `framer-motion`, `react-icons`, `tailwindcss`, `postcss`, `autoprefixer`)
  - [x] Configure Tailwind CSS & PostCSS
  - [x] Establish `src/constants/theme.js` (colors, 5px radius, typography, spacing, shadows)
  - [x] Setup global CSS with CSS variables linked to theme tokens
  - [x] Scaffold clean folder architecture (`features/`, `components/`, `context/`, `services/`, `constants/`, etc.)
  - [x] Setup App entry point, routing shell, and verify baseline dev server / build.

- [x] **Phase 2: Layout & Responsive Navigation**
  - [x] Build desktop top navbar with logo, nav links, active indicators, and quick CTA
  - [x] Build mobile bottom tab bar (Home, Analysis, Shades, Profile) with touch feedback
  - [x] Build layout wrapper with smooth route transitions
  - [x] Add mobile header with drawer/menu and notifications
  - [x] Test responsiveness at 320px, 375px, 768px, 1024px, 1440px.

- [x] **Phase 3: Home / Landing Page**
  - [x] Hero section with headline "Your Shade. Your Match.", CTAs ("Start Skin Analysis", "Explore Foundation Shades")
  - [x] Animated hero slider / showcase with beauty focus
  - [x] Feature cards (Skin Analysis, Undertone Detection, Foundation Matching, Blending Guidance)
  - [x] "How It Works" step-by-step interactive breakdown
  - [x] Pakistani market focus highlight section (local climates, diverse undertones, Masarrat Misbah, Rivaj, etc.)
  - [x] Featured shades preview
  - [x] Prototype disclaimer banner & polished footer.

- [x] **Phase 4: Skin Analysis Demo**
  - [x] Analysis intro with simulated scanner viewport & face positioning guide
  - [x] Prominent "Demo Mode" indicator and educational disclaimer
  - [x] Interactive simulated scanning animation with multi-step progress (Skin Tone, Undertone, Monk Scale)
  - [x] Simulated analysis results display:
    - Detected tone, undertone (warm/cool/neutral)
    - Monk Skin Tone category (MST 1-10)
    - Confidence indicator
    - Swatch preview & detailed explanation
  - [x] "View Foundation Matches" direct CTA and "Retry Analysis" reset button.

- [x] **Phase 5: Foundation Finder**
  - [x] Curate Pakistani & international brand foundation mock database (PKR pricing, shades, undertones, finishes)
  - [x] Product grid with product cards, swatch preview, finish badge, price in PKR
  - [x] Active search and multi-faceted filter system (Brand, Undertone, Skin Tone, Coverage, Budget range)
  - [x] Sort by Price (low/high), Popularity, Match rating
  - [x] Mobile filter drawer with animated slide-up
  - [x] Product Details Modal with "Why this shade?" match explanation, swatch comparison, and save/favorite
  - [x] Empty state with reset filters button.

- [x] **Phase 6: Blending Guide**
  - [x] Visual interactive facial zone map (Forehead/T-zone, Cheeks, Jawline & Neck, Under-eyes, Chin/Perioral)
  - [x] Region selection with highlight overlay
  - [x] Step-by-step application instructions with Previous/Next controls
  - [x] Simulated blending heatmap / coverage density indicator
  - [x] Blending tips for Pakistani weather/humidity & undertones
  - [x] Educational disclaimer & reset guide controls.

- [x] **Phase 7: Profile & Shared State**
  - [x] React Context (`AppContext`) managing saved shades, recent analysis history, user preferences
  - [x] LocalStorage synchronization for persistence
  - [x] User preferences (skin type, undertone, finish preference, budget tier, Pakistani brand priority)
  - [x] Saved shades collection with quick view/remove actions
  - [x] Recent scan history with recall ability
  - [x] Clear all prototype data action with confirmation modal.

- [x] **Phase 8: Animation & Visual Polish**
  - [x] Audit all animations for smooth Framer Motion transitions (respecting `prefers-reduced-motion`)
  - [x] Audit design tokens: verify 100% adherence to 5px border-radius and solid dark palette
  - [x] Zero gradients and zero gold verification
  - [x] Toast notification system for saves, resets, and actions
  - [x] Polished loading skeletons and feedback states.

- [x] **Phase 9: Testing & Final Verification**
  - [x] Run production build (`npm run build`) — Build verified with 0 errors
  - [x] Cross-device responsive test (mobile bottom navigation, drawer, desktop nav)
  - [x] Verify keyboard accessibility & ARIA attributes
  - [x] Final acceptance criteria audit completed.
