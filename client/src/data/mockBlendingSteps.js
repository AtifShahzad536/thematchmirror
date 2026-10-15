/**
 * Blending Guide Dataset & Facial Zone Mapping
 * Optimized for South Asian complexions, Pakistani regional climates, and HD wedding flash photography.
 */

export const FACE_ZONES = [
  {
    id: 'forehead',
    name: 'Forehead & T-Zone',
    coordinates: { x: 50, y: 22 },
    coverageRecommendation: 'Light to Medium (45%)',
    density: 45,
    motionType: 'Circular Buffing & Hairline Feather',
    motionDirection: 'Outward from center & upward into hairline',
    arrowAngle: -45,
    strokeTip: 'Feather sheerly near baby hairs to prevent white boundary buildup',
    tool: 'Damp Microfiber Sponge or Duo-Fiber Brush',
    toolRating: 96,
    targetPressure: 'Light feathering (20g)',
    instructions: 'Dispense a pea-sized amount onto the center of the forehead. Blend outward and upward in circular stippling motions toward the hairline. Keep coverage sheer near the edges to avoid visible buildup along baby hairs.',
    desiTip: 'In hot summer months, prep this zone with an oil-control primer first, as Pakistani weather often activates excess sebum across the T-zone.',
    pitfall: 'Applying heavy foundation straight into the hairline creates an unnatural wig-like border in daylight.'
  },
  {
    id: 'undereye',
    name: 'Under-Eye & Orbital Zone',
    coordinates: { x: 50, y: 38 },
    coverageRecommendation: 'Ultra Sheer (25%) + Warm Corrector',
    density: 25,
    motionType: 'Gentle Micro-Tapping (No Dragging)',
    motionDirection: 'Inner tear duct outward along orbital bone',
    arrowAngle: 10,
    strokeTip: 'Use ring finger or mini sponge tip to melt pigment into skin warmth',
    tool: 'Precision Mini Blender or Ring Finger',
    toolRating: 99,
    targetPressure: 'Feather-light tapping (10-15g)',
    instructions: 'Use minimal foundation here—heavy layers cause premature creasing under fine lines. If you have dark circles or bluish-brown pigmentation, tap an orange or warm peach corrector first, then sheer foundation over top.',
    desiTip: 'Dark circles are naturally prevalent due to genetic melanin; never try to lighten this area with a foundation that is 3 shades too pale, which turns ashy gray.',
    pitfall: 'Layering thick foundation under eyes causes premature creasing and emphasizes fine smile lines.'
  },
  {
    id: 'cheeks',
    name: 'Cheeks & Mid-Face Canvas',
    coordinates: { x: 50, y: 50 },
    coverageRecommendation: 'Buildable Medium-Full (80%)',
    density: 80,
    motionType: 'Dense Stipple & Press',
    motionDirection: 'Center of apples sweeping outward towards ears',
    arrowAngle: 25,
    strokeTip: 'Press firmly into pores to create a glass-like poreless texture',
    tool: 'Dense Angled Kabuki Brush or Teardrop Sponge',
    toolRating: 98,
    targetPressure: 'Medium pressing (35-40g)',
    instructions: 'Apply foundation from the apples of your cheeks sweeping gently outward towards your ears. Press the product into the skin rather than rubbing it back and forth to maintain maximum coverage over pores and redness.',
    desiTip: 'South Asian skin often exhibits natural high color on the cheekbones; allowing a hint of skin texture through prevents a flat, artificial canvas.',
    pitfall: 'Swiping back and forth in streaks strips pigment from the center where most redness or pigmentation sits.'
  },
  {
    id: 'chin',
    name: 'Perioral Zone (Mouth & Chin)',
    coordinates: { x: 50, y: 64 },
    coverageRecommendation: 'Targeted Warm Neutralization (75%)',
    density: 75,
    motionType: 'Targeted Warm Micro-Stipple',
    motionDirection: 'Corners of mouth downward and around chin curve',
    arrowAngle: 90,
    strokeTip: 'Neutralize natural shadows with warm golden undertone foundation',
    tool: 'Micro Detail Sponge or Flat Stippler',
    toolRating: 94,
    targetPressure: 'Light stippling (25g)',
    instructions: 'The perioral area around the mouth often carries natural hyperpigmentation in South Asian complexions. Dab warm golden undertone foundation with light pressing motions. Set immediately with a light dusting of translucent powder.',
    desiTip: 'Avoid using cold/pink foundations here. Warm yellow-based formulas melt seamlessly into the natural shadow around the mouth.',
    pitfall: 'Using cool/pink foundation around the mouth turns gray within 20 minutes of oxidation.'
  },
  {
    id: 'jawline',
    name: 'Jawline & Neck Transition',
    coordinates: { x: 50, y: 78 },
    coverageRecommendation: 'Seamless Feathered Gradient (60%)',
    density: 60,
    motionType: 'Downward Feathering Strokes',
    motionDirection: 'From jawbone down 2-3 inches into neck and clavicle',
    arrowAngle: 90,
    strokeTip: 'Blend with sponge remnant pigment — do not apply fresh pump on neck',
    tool: 'Large Fluffy Buffing Brush or Damp Sponge Base',
    toolRating: 97,
    targetPressure: 'Featherlight downward sweeps (15g)',
    instructions: 'The single most critical step for Pakistani complexions! Blend whatever product remains on your sponge down past the jawline and at least 2 to 3 inches down the neck. Ensure zero demarcation line exists.',
    desiTip: 'In traditional Pakistani formal attire (Kurtas, Ghararas, Sarees), the neck and collarbone are frequently on display. A mismatched neck is the #1 makeup error in event photography.',
    pitfall: 'Stopping abruptly at the jawline creates the notorious floating mask effect in flash photos.'
  }
];

export const BLENDING_STEPS = [
  {
    stepNumber: 1,
    title: 'Skin Prep & Thermal Priming',
    zoneId: 'forehead',
    duration: '2 minutes',
    durationSeconds: 120,
    summary: 'Hydrate and prep based on your local Pakistani region.',
    details: 'Cleanse and apply a lightweight gel moisturizer. If you reside in humid areas like Karachi or during summer monsoon in Lahore/Rawalpindi, apply a mattifying primer on your T-zone. In dry winter climates (Quetta, Islamabad), opt for a hydrating serum primer.',
    proTip: 'Wait 60 seconds before foundation application so skincare is fully absorbed.',
    desiTip: 'Never apply foundation over dry flaky patches. A 30-second thermal mist lock primes South Asian skin for seamless melt.',
    techniqueSpecs: {
      motion: 'Gentle Press & Pat',
      pressure: 'Ultra-Light (15g)',
      speed: 'Relaxed gliding',
      finishTarget: 'Balanced Hydration'
    },
    primaryTool: { name: 'Fingertip Heat or Flat Synthetic Brush', matchPercent: 95, note: 'Body heat helps primer emulsify' },
    altTool: { name: 'Damp Teardrop Sponge', matchPercent: 88, note: 'Press into enlarged pores' },
    pitfallWarning: {
      mistake: 'Applying foundation immediately over wet primer',
      fix: 'Wait 60-90 seconds until primer feels tacky to the touch before first dot'
    }
  },
  {
    stepNumber: 2,
    title: 'Center-Outward Foundation Distribution',
    zoneId: 'cheeks',
    duration: '3 minutes',
    durationSeconds: 180,
    summary: 'Apply foundation dots to high points and buff outward.',
    details: 'Dot foundation on the apples of cheeks and center of forehead. With a slightly damp sponge or dense kabuki brush, tap and press the pigment into the skin rather than sliding it across.',
    proTip: 'Never wipe foundation like lotion; tapping deposits even micro-layers that do not cake.',
    desiTip: 'Start with half a pump first. South Asian skin looks most youthful when radiant natural undertone gleams through.',
    techniqueSpecs: {
      motion: 'Dense Micro-Stipple & Bounce',
      pressure: 'Medium Firm (35g)',
      speed: '120 taps/min rhythm',
      finishTarget: 'Poreless Velvet Canvas'
    },
    primaryTool: { name: 'Damp Microfiber Blender', matchPercent: 98, note: 'Towel-squeezed to 90% dry' },
    altTool: { name: 'Dense Angled Kabuki', matchPercent: 91, note: 'Use micro-circular buffing motions' },
    pitfallWarning: {
      mistake: 'Dragging or wiping the tool across cheeks',
      fix: 'Only tap and bounce at 90° angle to deposit pigment without micro-streaks'
    }
  },
  {
    stepNumber: 3,
    title: 'Orbital Sheering & Peach Correction',
    zoneId: 'undereye',
    duration: '2 minutes',
    durationSeconds: 120,
    summary: 'Neutralize shadows gently without heavy creasing layers.',
    details: 'The skin around the eyes is 40% thinner than the cheeks. Apply a pin-sized dot of warm peach color corrector first to neutralize melanin depth, then gently feather the sheerest leftover foundation veil over top.',
    proTip: 'Set with a whisper-light dusting of translucent powder pressed with a triangle velvet puff.',
    desiTip: 'Never use a cool pink concealer to brighten South Asian dark circles; it creates an unmistakable ashy blue reflection in wedding strobe lights.',
    techniqueSpecs: {
      motion: 'Ring Finger Feather-Tap',
      pressure: 'Feather-Light (10g)',
      speed: 'Slow gentle taps',
      finishTarget: 'Crease-Free Brightness'
    },
    primaryTool: { name: 'Precision Mini Sponge Tip', matchPercent: 99, note: 'Fits orbital socket perfectly' },
    altTool: { name: 'Warm Ring Finger', matchPercent: 94, note: 'Natural body warmth melts waxes' },
    pitfallWarning: {
      mistake: 'Piling thick heavy foundation directly into fine smile lines',
      fix: 'Keep under-eye layers paper-thin; let color corrector do the heavy lifting'
    }
  },
  {
    stepNumber: 4,
    title: 'Perioral Neutralization & Chin Balancing',
    zoneId: 'chin',
    duration: '2 minutes',
    durationSeconds: 120,
    summary: 'Even out natural warmth around mouth and chin.',
    details: 'Take a tiny drop of warm golden foundation and gently stipple around the corners of the mouth and chin. Blend downward into the jawline.',
    proTip: 'Warm undertone foundations counteract grayish casts instantly without needing thick concealer layers.',
    desiTip: 'South Asian complexions naturally feature higher melanin concentration in the perioral zone. Match undertone here rather than forehead.',
    techniqueSpecs: {
      motion: 'Targeted Micro-Stipple',
      pressure: 'Light (25g)',
      speed: 'Medium cadence',
      finishTarget: 'Even Warmth Continuity'
    },
    primaryTool: { name: 'Flat Stippling Brush', matchPercent: 96, note: 'Distributes micro-droplets' },
    altTool: { name: 'Pointed Sponge Tip', matchPercent: 90, note: 'Gets into smile crevices' },
    pitfallWarning: {
      mistake: 'Applying cold pink or neutral base here',
      fix: 'Ensure foundation has golden or olive undertones to prevent gray mouth halo'
    }
  },
  {
    stepNumber: 5,
    title: 'The Demarcation-Free Jawline Blend',
    zoneId: 'jawline',
    duration: '2 minutes',
    durationSeconds: 120,
    summary: 'Transition flawlessly into the neck and collarbone.',
    details: 'Check your match in natural or diffuse daylight. Feather downward with swift, feather-light brush strokes past the jaw angle into the throat. Ensure identical undertone continuity.',
    proTip: 'If your neck is naturally a half-shade lighter or darker than your face, match to your chest for harmony in formal photographs.',
    desiTip: 'The #1 error seen in Pakistani wedding albums is the "floating head" effect. Feather at least 2 inches below the jawline into the neck hollow.',
    techniqueSpecs: {
      motion: 'Downward Feather-Sweep',
      pressure: 'Ultra-Light (20g)',
      speed: 'Long downward strokes',
      finishTarget: 'Zero-Line Transition'
    },
    primaryTool: { name: 'Large Fluffy Buffing Brush', matchPercent: 97, note: 'Diffuses pigment edges seamlessly' },
    altTool: { name: 'Bottom Dome of Damp Blender', matchPercent: 92, note: 'Sweep downward into collarbone' },
    pitfallWarning: {
      mistake: 'Stopping blending exactly at the sharp jawline edge',
      fix: 'Always bring sponge down 2-3 inches onto the neck with whatever residue remains'
    }
  },
  {
    stepNumber: 6,
    title: 'Micro-Setting & Humidity Lock',
    zoneId: 'forehead',
    duration: '1 minute',
    durationSeconds: 60,
    summary: 'Lock in moisture without flattening radiant natural glow.',
    details: 'Using a velvet puff or soft powder brush, press a finely milled translucent setting powder onto the T-zone and smile lines. Mist with an alcohol-free setting spray for 12-hour humidity protection.',
    proTip: 'Do not bake the entire face with white talc powder; targeted setting preserves your skin’s dimensional radiance.',
    desiTip: 'Use a yellow or banana-tinted setting powder rather than pure white silica powder to prevent camera flashback ghosting.',
    techniqueSpecs: {
      motion: 'Velour Puff Press & Roll',
      pressure: 'Firm Press (30g)',
      speed: 'Deliberate press-and-hold',
      finishTarget: '14-Hour Humidity Shield'
    },
    primaryTool: { name: 'Triangle Velour Powder Puff', matchPercent: 98, note: 'Locks oil in T-zone pores' },
    altTool: { name: 'Fluffy Tapered Powder Brush', matchPercent: 89, note: 'Light dusting on perimeter' },
    pitfallWarning: {
      mistake: 'Baking with high-silica white powder',
      fix: 'Always use micro-milled yellow/banana powder to avoid white flashback in wedding photos'
    }
  }
];

export const BLENDING_MODES = [
  {
    id: 'bridal',
    name: 'Pakistani Barat & Wedding Glam',
    shortName: 'Bridal Glam',
    icon: '👰',
    tag: '14-Hour Ultra-Wear',
    description: 'Full high-definition coverage, 14-hour monsoon sweat-proofing, and flash-photography reflection calibration.',
    finish: 'Camera-Ready Satin Velvet',
    coverageMultiplier: 1.25,
    densityMap: { forehead: 60, undereye: 35, cheeks: 95, chin: 85, jawline: 75 },
    heroTool: 'Dense Kabuki + Damp Microfiber Press'
  },
  {
    id: 'everyday',
    name: 'Everyday Desi Dewy Glow',
    shortName: 'Everyday Glow',
    icon: '🌿',
    tag: 'Daylight Fresh',
    description: 'Lightweight, second-skin radiance optimized for Pakistani university, work, and casual outdoor daylight.',
    finish: 'Luminous Second-Skin Dewy',
    coverageMultiplier: 0.8,
    densityMap: { forehead: 35, undereye: 20, cheeks: 60, chin: 50, jawline: 40 },
    heroTool: 'Damp Microfiber Teardrop Sponge'
  },
  {
    id: 'monsoon',
    name: 'Monsoon & Karachi Humidity Shield',
    shortName: 'Humidity Shield',
    icon: '🌧️',
    tag: 'Sweat-Proof',
    description: 'T-zone oil resistance, transfer-proof micro-baking, and ultra-locked foundation for 90%+ humidity.',
    finish: 'Transfer-Proof Matte Velvet',
    coverageMultiplier: 1.0,
    densityMap: { forehead: 65, undereye: 25, cheeks: 75, chin: 70, jawline: 55 },
    heroTool: 'Triangle Velour Puff + Setting Mist'
  }
];

export const BLENDING_TOOLS_ARSENAL = [
  {
    id: 'sponge',
    name: 'Damp Microfiber Teardrop Sponge',
    category: 'Universal Application',
    bestFor: 'Buildable Second-Skin Finish',
    coverageYield: 'Medium (Absorbs excess, leaves sheer veil)',
    prepStep: 'Soak under running water, squeeze firmly in clean towel until 90% dry.',
    proVerdict: '98% match for South Asian complexions. Prevents cakey foundation buildup.'
  },
  {
    id: 'kabuki',
    name: 'Dense Angled Flat-Top Kabuki Brush',
    category: 'Full Coverage Mastery',
    bestFor: 'Bridal & High-Pigmentation Concealing',
    coverageYield: 'High (Deposits 90%+ of pigment onto skin)',
    prepStep: 'Work in micro-circular stippling motions; do not swipe in straight lines.',
    proVerdict: 'Ideal for wedding events and covering stubborn hyperpigmentation.'
  },
  {
    id: 'stippler',
    name: 'Duo-Fiber Precision Stippling Brush',
    category: 'Airbrushed Diffusion',
    bestFor: 'Feathering Jawline & Sensitive Cheek Areas',
    coverageYield: 'Sheer to Medium (Diffuse light finish)',
    prepStep: 'Only touch white synthetic bristle tips to skin with feather-light pressure.',
    proVerdict: 'Essential for eliminating demarcation lines between jawline and neck.'
  },
  {
    id: 'velour_puff',
    name: 'Triangle Velour Setting Powder Puff',
    category: 'Thermal & Sebum Lock',
    bestFor: 'T-Zone & Under-Eye Anti-Crease Setting',
    coverageYield: 'Micro-Pressed Powder Layer',
    prepStep: 'Rub puff against back of hand first to evenly disperse powder into fibers.',
    proVerdict: 'Pakistani summer essential to stop shine without looking powdery.'
  }
];

export const BLENDING_TROUBLESHOOTING = [
  {
    id: 'demarcation',
    symptom: 'Floating Head Effect in Wedding Flash Photos',
    cause: 'Blending stopped right at the sharp jawline edge, or matching to wrist instead of chest.',
    desiFix: 'Always blend remnant foundation 2-3 inches down the neck. Match shade to your collarbone in daytime light.'
  },
  {
    id: 'ashy_undereye',
    symptom: 'Under-Eyes Turning Gray or Ashy Blue',
    cause: 'Using a cool/pink concealer 2-3 shades lighter than skin without color correction.',
    desiFix: 'Dab a warm peach/orange corrector first to neutralize dark melanin, then sheer warm foundation over top.'
  },
  {
    id: 'tzone_separation',
    symptom: 'Foundation Melting or Separating on Nose & Forehead',
    cause: 'High Karachi/Lahore humidity activating facial sebum under heavy oil-based foundation.',
    desiFix: 'Apply a mattifying primer on the T-zone only. Press translucent banana powder with a dry velour puff.'
  },
  {
    id: 'cakey_smile_lines',
    symptom: 'Foundation Cracking Along Smile Lines within 2 Hours',
    cause: 'Applying full-coverage foundation over high-movement facial expression lines.',
    desiFix: 'Keep product ultra-thin around mouth. After applying, smile and blot excess with a clean damp sponge tip.'
  }
];

