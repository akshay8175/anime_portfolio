# Luxury Portfolio Hero Section

An award-winning, luxury portfolio hero section featuring an ultra-smooth, zero-lag, zero-ghosting cursor-tracking character animation. Built with React (Vite) and powered by a highly optimized HTML5 Canvas rendering engine.

## ✨ Features

- **Zero-Ghosting 60 FPS Canvas Renderer:** Avoids `<video>` playback constraints (like seeking lag or uncontrollable background playback) by pre-extracting the character rotation into 64 lightweight WebP frames.
- **Shortest-Path Circular Interpolation:** Uses shortest-path angular lerping (`Math.atan2(dy, dx)`) for buttery smooth head rotation tracking.
- **Center Eye Contact Deadzone:** Detects when the cursor is near the character's face (12% screen radius) and automatically swaps to a neutral frame for direct eye contact.
- **Seamless Background Integration:** Programmatically matches the exact video background color (`#af161a`) with the Canvas and DOM to create a borderless, full-screen illusion.
- **Magnetic Custom Cursor:** A sleek, glowing dot and smooth trailing aura ring that gracefully scales over interactive elements.
- **Full Mobile Touch Support:** Translates touches into cursor tracking, with smooth fade-in/fade-out lifecycles on `touchstart` and `touchend`.
- **No CSS 3D Transforms:** Strictly adheres to performance constraints—the page and character's body remain completely motionless while the face follows the cursor.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- npm or yarn

### Installation

1. Clone or download the repository.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the Vite development server:
```bash
npm run dev
```
The site will be available at `http://localhost:5173/`.

### Building for Production

To create an optimized production build:
```bash
npm run build
```
The built files will be located in the `dist/` directory, ready to be deployed to Vercel, Netlify, or any static hosting service.

## 🛠️ Tech Stack

- **Framework:** React + Vite
- **Renderer:** HTML5 `<canvas>` API (2D Context)
- **Styling:** Vanilla CSS with custom variables
- **Typography:** Google Fonts (Inter & Dancing Script)

## 📁 Project Structure

- `src/App.jsx`: The core React component containing the event listeners, interpolation logic, and the Canvas Renderer loop.
- `src/App.css`: Styles for the full-screen layout, frosted-glass header, hero typography, and custom cursor.
- `public/frames/`: Contains the pre-extracted `0000.webp` to `0063.webp` rotation frames and `center.webp`.

## 💡 How It Works (The Math)

Instead of using costly DOM rotation or laggy video playback seeking, this project implements a highly optimized frame-mapping loop:

1. **Preloading:** All 64 frames (a full 360° turn) are loaded into memory.
2. **Angle Calculation:** We calculate the angle between the center of the screen and the current cursor/touch position.
3. **Interpolation:** We use a circular linear interpolation function (`lerpAngle`) with a response factor of `0.26` to animate the head smoothly rather than snapping.
4. **Frame Mapping:** The normalized angle is translated into an index from 0 to 63, and that exact frame is painted onto the canvas at 100% opacity.
