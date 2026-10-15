/**
 * Simulated Skin Analysis Mock Engine & Monk Scale Dataset
 * Clearly marked as prototype demonstration data.
 */

export const MONK_SKIN_TONES = [
  { id: 'MST 01', hex: '#F7EDE4', label: 'Very Fair Porcelain', desc: 'Minimal melanin; predominantly pale with sensitive undertones.' },
  { id: 'MST 02', hex: '#F3DFC8', label: 'Fair Ivory', desc: 'Fair complexion with subtle warm or cool luminescence.' },
  { id: 'MST 03', hex: '#E6C4A6', label: 'Light Cream', desc: 'Light South Asian complexion commonly found in northern regions.' },
  { id: 'MST 04', hex: '#DDB189', label: 'Light Medium Sand', desc: 'Subtle golden warmth, golden undertone prevalent.' },
  { id: 'MST 05', hex: '#CB986C', label: 'Medium Wheatish', desc: 'The quintessential South Asian wheatish complexion; high golden/olive balance.' },
  { id: 'MST 06', hex: '#B98357', label: 'Medium Tan Almond', desc: 'Sun-kissed medium tan with rich yellow and subtle amber pigments.' },
  { id: 'MST 07', hex: '#A36F45', label: 'Tan Amber', desc: 'Warm amber-honey richness, resilient to sunlight; rarely burns.' },
  { id: 'MST 08', hex: '#8C5A35', label: 'Deep Tan Bronze', desc: 'Deep golden-bronze with deep red/amber micro-undertones.' },
  { id: 'MST 09', hex: '#6F4125', label: 'Rich Warm Espresso', desc: 'Rich melanin depth with radiant warmth and minimal oxidation risk.' },
  { id: 'MST 10', hex: '#442817', label: 'Deep Ebony', desc: 'Deepest chromatic richness; highly structured undertone harmony.' },
];

export const DEMO_PRESETS = [
  {
    id: 'persona-wheatish',
    name: 'Wheatish Warm (Most Popular Desi Complexion)',
    skinTone: 'Medium (Wheatish)',
    undertone: 'warm',
    monkScale: 'MST 05',
    hexSample: '#CB986C',
    confidenceScore: 94.8,
    sampleImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    undertoneExplanation: 'Your skin reflects dominant golden and peachy light wavelengths. Foundations with yellow/golden bases prevent the common grayish or ashy cast experienced with cool-toned European formulas.',
    climateTip: 'In Pakistani humid climates (Monsoon/Karachi), select an oil-controlling matte or semi-matte base to prevent midday shine without stripping moisture.',
    matchingShadeIds: ['mm-01-beige', 'mayb-220', 'rivaj-02', 'huda-300n']
  },
  {
    id: 'persona-fair-neutral',
    name: 'Fair Neutral (Northern Complexion)',
    skinTone: 'Light Fair',
    undertone: 'neutral',
    monkScale: 'MST 03',
    hexSample: '#E6C4A6',
    confidenceScore: 96.2,
    sampleImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    undertoneExplanation: 'Your facial melanin shows an equal balance of warm yellow and cool rosy pigments. You can wear both neutral and soft warm foundations seamlessly.',
    climateTip: 'Fair skin in sunny Pakistani regions benefits from foundations with built-in physical UV barriers (zinc/titanium) to prevent sun spots.',
    matchingShadeIds: ['mm-01-fair', 'mayb-118', 'rivaj-01', 'loreal-2w']
  },
  {
    id: 'persona-olive-tan',
    name: 'Warm Olive Tan (Coastal Complexion)',
    skinTone: 'Tan (Olive Rich)',
    undertone: 'olive',
    monkScale: 'MST 07',
    hexSample: '#A36F45',
    confidenceScore: 93.4,
    sampleImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    undertoneExplanation: 'Your skin contains subtle greenish-golden undertones typical of classic South Asian heritage. Avoid pink-based foundations which look drastically chalky against your neck.',
    climateTip: 'Opt for long-wear formulations with sweat-resistance so pigment adheres smoothly across warm coastal climates.',
    matchingShadeIds: ['mm-01-honey', 'mayb-228', 'rivaj-03', 'huda-400g']
  },
  {
    id: 'persona-deep-warm',
    name: 'Rich Deep Bronze (Subtropical Sun)',
    skinTone: 'Deep Tan',
    undertone: 'warm',
    monkScale: 'MST 08',
    hexSample: '#8C5A35',
    confidenceScore: 95.1,
    sampleImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&auto=format&fit=crop&q=80',
    undertoneExplanation: 'Deep golden-amber warmth. Requires saturated, pure pigments to accentuate your natural glow without flattening your dimensional facial structure.',
    climateTip: 'Avoid heavy baking powders with white talc; set with tinted banana or translucent honey powders.',
    matchingShadeIds: ['mm-01-caramel', 'mayb-330', 'rivaj-04', 'huda-420g']
  }
];

export const SCAN_MILESTONES = [
  { step: 1, label: 'Initializing simulated visual sensor & calibrating lighting...' },
  { step: 2, label: 'Detecting facial contours, forehead, cheeks, and jawline...' },
  { step: 3, label: 'Filtering ambient shadow reflections and spectral bounce...' },
  { step: 4, label: 'Mapping melanin density across Monk Skin Tone (MST) scale...' },
  { step: 5, label: 'Evaluating warm vs neutral undertone color balance...' },
  { step: 6, label: 'Cross-referencing Pakistani foundation shade database...' },
];
