# The Match Mirror (v1.0 Desktop) 🪞💻

> **AI-Powered Colorimetric Skin Tone Analysis & Foundation Recommendation Workstation**

The Match Mirror is a desktop-grade skin analysis and cosmetic matching workstation built with real-time computer vision, CIELAB colorimetry, and CIEDE2000 precision color-difference mathematics.

---

## ✨ Features

- **01 Dashboard / Home**: Telemetry mission control, real-time pipeline status, top-match spotlight, and Pakistani climate adaptation metrics.
- **02 Camera & Quality Check**: Live optical feed analysis with real-time Exposure EV, Lux sensor, Laplacian blur detection, roll posture angle, pre-flight checklist, and automated advice audit console.
- **03 Skin Color Analysis**: MediaPipe 478-points face mesh tracking, dynamic 4-anatomical ROI pixel sampling (Forehead, Cheeks, Jawline), Monk Skin Tone (MST 1-10) classification, and Individual Typology Angle (ITA°).
- **04 Foundation Recommendations**: CIEDE2000 $\Delta E_{00}$ color distance matching against Pakistani & international brands (Maybelline, Masarrat Misbah, Rivaj UK, MAC, Medora, Huda Beauty).
- **05 Blending Heatmap**: Real-time 15 FPS WebGL/Canvas shader overlay visualizing blend demarcation lines and feathering variance across 6 facial zones.
- **06 System Diagnostics**: Interactive developer console with hardware telemetry, live latency ping, log filters, and diagnostic benchmarks.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/AtifShahzad536/thematchmirror.git
cd thematchmirror

# Install client dependencies
cd client
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` (or the indicated port) to launch the workstation console.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, React Router
- **Colorimetry Engine**: CIELAB $L^*a^*b^*$, CIEDE2000 $\Delta E$, ITA°, sRGB conversions
- **Computer Vision**: HTML5 Canvas Video Telemetry, MediaPipe 478 Landmark Overlays

---

## 📄 License

Proprietary / Academic FYP — All rights reserved.
