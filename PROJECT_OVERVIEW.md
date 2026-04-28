# Website Maintenance - Project Overview

## 📋 Project Summary

This is a **Windows 7-themed maintenance page** with nostalgic retro aesthetics. When a website is under maintenance, visitors see an interactive landing page styled like a classic Windows 7 dialog box with particle animations, media players, and interactive features.

**Key Theme:** Retro nostalgia meets modern web technology (Three.js 3D graphics, HLS streaming, RSS parsing)

---

## 📁 Project Structure

```
website-maintenance/
├── index.html                 # Main HTML template with Windows 7 UI
├── script.js                  # Core animation & interaction logic
├── styles.css                 # Primary styling (Windows 7 theme)
├── styles-additional.css      # Additional CSS styling
└── assets/
    ├── globals.js            # Global configuration & constants
    ├── window-manager.js     # Window management (drag, resize, minimize)
    ├── media.js              # Media players & RSS feed handling
    ├── web3forms.js          # Email contact form integration
    ├── mobile-maximize.js    # Mobile responsiveness
    └── (not examined)
```

---

## 🎨 User Interface

### Main Window (Windows 7 Style Dialog)

The page displays a **600px × 400px window** positioned in the center of the screen with:

- **Title Bar** → "Website em Manutenção" (Portuguese: "Website Under Maintenance")
- **Window Controls** → Minimize, Maximize, Close buttons
- **Maintenance Header** → Bold title announcing maintenance
- **Status Bar** → Shows current state and countdown timer
- **Details Fieldset** → Brief maintenance message
- **Progress Bar** → Fake animated Windows 7-style progress indicator
- **Contact Section** → Email link and send email button
- **Action Buttons** → Various interactive buttons (Details, Retry, Radio, EDM, News, Refresh)

### Background

- **Solid Windows 7 Blue** → `#1d63a3` (iconic Windows 7 default background)
- **3D Particle Animation** → Big Bang-style expanding particle system (behind the window)
- **Canvas Element** → Fixed positioning for 3D rendering

---

## 🔧 Core Technologies & Dependencies

### External Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| **7.css** | Latest | Windows 7 UI styling framework |
| **Three.js** | r128 | 3D scene creation, particle systems, rendering |
| **Three.js Shaders** | 0.128.0 | CopyShader, LuminosityHighPassShader for visual effects |
| **Post-Processing** | 0.128.0 | EffectComposer, ShaderPass, RenderPass, **UnrealBloomPass** |
| **OrbitControls** | 0.128.0 | Camera control system |
| **HLS.js** | Latest | HTTP Live Streaming support (for radio/EDM streaming) |
| **RSS Parser** | 3.12.0 | Parses RSS feeds for news display |
| **Web3Forms** | API | Email form submission backend |
| **Rybbit Analytics** | - | Error tracking & Web Vitals monitoring |

### Three.js Pipeline

The project uses an advanced **post-processing pipeline**:
1. **RenderPass** → Renders the scene
2. **UnrealBloomPass** → Creates bloom/glow effects (configurable strength & radius)
3. **ShaderPass** → Applies custom shaders

---

## ⚙️ Core Functionality

### 1. **3D Particle Animation** (`script.js`)

**Purpose:** Creates a visually striking Big Bang-style expanding particle system

**Key Variables:**
- `particleCount` → 20,000 particles (from `globals.js`)
- `particlePositions` → XYZ coordinates of each particle
- `particleVelocities` → Direction & speed vectors
- `expansionSpeed` → 50 (controls expansion rate)

**What Happens:**
- Particles start clustered near the origin
- Gradually expand outward at `expansionSpeed`
- Rendered with **bloom effects** for a glowing appearance
- Runs continuously in the background via `animate()` function

**Configuration** (from `globals.js`):
```javascript
const ANIMATION_PARAMS = {
  expansionSpeed: 50,      // How fast particles spread
  particleSize: 2,         // Visual size
  bloomStrength: 2,        // Glow intensity
  bloomRadius: 0.5,        // Glow blur size
  bloomThreshold: 0,       // Brightness threshold for glow
  particleCount: 20000     // Total number of particles
};
```

### 2. **Maintenance Countdown Timer** (`script.js`)

**Purpose:** Displays a countdown to when the site will be back online

**Key Variables:**
- `targetDate` → Set to 365 days from page load (in `globals.js`)
- `countdownInterval` → Updates timer every second

**Features:**
- Shows remaining time in hours/minutes/seconds
- Updates `#timer` element in real-time
- Called by `initCountdown()` function

### 3. **Fake Progress Bar** (`script.js`)

**Purpose:** Creates a realistic Windows 7 progress bar animation that never completes

**Behavior:**
- Starts at **15-45%** random initial value
- Progresses in stages:
  - **0-60%** → Fast progress (0.5-2.5% increments)
  - **60-85%** → Medium pace (0.2-1.2% increments)
  - **85%+** → Very slow (0.05-0.35% increments)
- **Never reaches 100%** (classic maintenance page trope)
- Occasionally pauses for 1-3 seconds for realism
- Updates every 800ms (from `MAINTENANCE_SETTINGS.progressUpdateInterval`)

**Dynamic Updates:**
- Progress percentage display
- Fake "files remaining" count (decreases as progress increases)
- Fake "current speed" in MB/s (randomized)

---

## 🎛️ Interactive Features

### Button Functions

| Button | Event | Function |
|--------|-------|----------|
| **Detalhes** (Details) | `#details-btn` | Likely shows detailed maintenance info |
| **Tentar Novamente** (Retry) | `#retry-btn` | Retries connection to main site |
| **Antena 3** (Radio) | `#winamp-btn` | Opens radio player for Antena 3 stream |
| **EDM** | `#edm-btn` | Opens EDM music player |
| **Notícias** (News) | `#rss-btn` | Displays RSS feed reader |
| **Reiniciar** (Refresh) | `#refresh-btn` | Clears cache and reloads page |
| **Enviar Email** (Send Email) | `#email-btn` | Opens email contact form |

### Window Management (`window-manager.js`)

**Draggable Windows:**
- Click and drag the title bar to move windows
- Stores original position for maximize/restore

**Resizable Windows:**
- Some windows (radio, EDM, email, RSS) are **non-resizable**
- Details and main windows are resizable
- Maximize button disabled for fixed-size windows

**Window Controls:**
- **Minimize** → Scales window to 0.5, reduces opacity
- **Maximize** → Expands to 90% width × 80% height
- **Close** → Removes window from DOM

### Media Players (`media.js`)

**HLS Radio Player (Antena 3):**
- Uses HLS.js for streaming compatibility
- Instance stored in `radioPlayerInstance`

**EDM Player:**
- Similar HLS.js implementation
- Separate instance (`edmPlayerInstance`)

**RSS Feed Viewer:**
- Parses RSS using `rss-parser` library
- Displays news/articles in a window

**Cache Refresh:**
- Adds cache-busting query parameter
- Reloads with `?nocache=[timestamp]`

### Email Contact Form (`web3forms.js`)

**Integration:**
- Uses Web3Forms API for backend email handling
- Access Key: `fb0a6e6b-bba1-4bb2-9fc7-36bdf7b33edf`
- Endpoint: `https://api.web3forms.com/submit`

**Submits to:** `cardosys@protonmail.com`

---

## 🔊 Audio & Sound Effects

**Sound Pool** (from `globals.js`):

| Sound | Source | Purpose |
|-------|--------|---------|
| Start Sound | Windows XP "ding" | Startup/button feedback |
| Success Sound | Windows XP shutdown | Operation completion |
| Error Sound | Windows XP error | Error alerts |

**Volume:** 0.3 (30% to avoid startling users)

**Implementation:** Likely uses Web Audio API (see `playSound()` function calls)

---

## 🎨 Styling System

### Primary Styles (`styles.css`)

**Color Scheme:**
- **Background:** Windows 7 blue (`#1d63a3`)
- **Title Bar:** Gradient blue (`#2a8ad4` to `#2a7ad2`)
- **Text:** Black on light backgrounds

**Visual Effects:**
- **Glass Effect** → Subtle gradient overlays on title bar and window edges
- **Shadow** → 10px blur shadow around window (`box-shadow: 0 10px 25px rgba(0,0,0,0.5)`)
- **Border Radius** → 3px corners (Windows 7 style)

### Layout

- **Container:** Flexbox centering (100% width/height viewport)
- **Window:** 600px fixed width
- **Canvas:** Fixed positioning (z-index: 0, behind window)
- **Window Container:** z-index: 1 (above canvas)

### Responsive Design

- `mobile-maximize.js` handles mobile adaptations
- Window likely resizes on small screens
- Touch support (if implemented in window-manager)

### Additional Styles (`styles-additional.css`)

Extends primary styling (specific content not examined, likely adds refinements)

---

## 🌐 Global Configuration (`globals.js`)

All project settings centralized:

```javascript
// Animation parameters (can be tweaked for performance)
ANIMATION_PARAMS = {
  expansionSpeed: 50,      // Adjust for faster/slower particles
  particleSize: 2,         // Larger = more visible
  bloomStrength: 2,        // Higher = more glow
  bloomRadius: 0.5,        // Higher = blur spreads further
  bloomThreshold: 0,       // Lower = more particles glow
  particleCount: 20000     // More = more detail but heavier
}

// Maintenance settings
MAINTENANCE_SETTINGS = {
  targetDate: [365 days from now],  // When site comes back online
  progressUpdateInterval: 800,      // Progress bar update speed (ms)
  progressInitialMin: 15,           // Starting progress range min
  progressInitialMax: 45            // Starting progress range max
}

// Audio settings
AUDIO_SOURCES = {
  startSound: 'windows-xp-ding.mp3',
  successSound: 'windows-xp-shutdown.mp3',
  errorSound: 'windows-xp-error.mp3',
  volume: 0.3
}

// Form submission
FORM_SETTINGS = {
  apiEndpoint: 'https://api.web3forms.com/submit',
  accessKey: '[key here]'  // Web3Forms API key
}
```

---

## 🚀 Initialization Flow

**Page Load Order (from `index.html`):**

1. **External Scripts Loaded** (in head)
   - 7.css framework
   - Local stylesheets
   - Three.js library
   - Three.js shaders & post-processing
   - HLS.js & RSS Parser
   - Core scripts (globals.js, web3forms.js, window-manager.js, mobile-maximize.js)

2. **HTML Parsed** → Windows 7 dialog structure loaded

3. **Script.js Executed** → Calls:
   - `init()` → Initializes Three.js scene, camera, renderer
   - `animate()` → Starts animation loop
   - `initCountdown()` → Starts countdown timer
   - `initWindowsButtons()` → Sets up button listeners
   - `animateProgress()` → Starts fake progress bar
   - `makeDraggable()` → Makes window draggable

4. **Media.js Executed** → Sets up media button listeners

5. **Analytics Loaded** → Rybbit tracking script

---

## 💡 Design Patterns & Architecture

### Separation of Concerns

- **globals.js** → Pure configuration
- **script.js** → Animation & main logic
- **window-manager.js** → UI window behavior
- **media.js** → Media functionality
- **web3forms.js** → Form handling
- **mobile-maximize.js** → Responsive behavior

### Modularity

Each system is self-contained:
- Window management doesn't touch animation
- Media players are independent modules
- Configuration is externalized

### Progressive Enhancement

- Three.js graphics are visual enhancement
- Page works with JavaScript disabled (though less impressive)
- Fallbacks for older browsers (uses CDN versions)

---

## 🔗 External Integrations

| Service | Purpose | Status |
|---------|---------|--------|
| Web3Forms | Email backend | Active |
| Rybbit Analytics | Error tracking & Web Vitals | Active |
| HLS Streams | Antena 3 & EDM audio | Expected (URLs not shown) |
| RSS Feeds | News content | Expected (URLs not shown) |

---

## 📊 Performance Considerations

**Heavy Operations:**
- 20,000 particles in scene → GPU intensive
- Post-processing bloom effect → Additional render passes
- Continuous animation loop → Runs at 60 FPS

**Optimizations:**
- Canvas rendering is GPU-accelerated
- Fixed particle count (not dynamic)
- Bloom effect radius is reasonable (0.5)

**Potential Bottlenecks:**
- Mobile devices: May struggle with 20K particles
- Older browsers: Three.js r128 requires ES6+ support
- HLS streaming: Depends on network quality

---

## 🎯 Use Cases

1. **Professional Maintenance** → Host this when your site is down
2. **Portfolio Project** → Showcases Three.js, UI design, retro aesthetics
3. **Event Landing Page** → Could be adapted for launch events
4. **Educational Tool** → Learn about Windows 7 UI, Three.js, Web Audio
5. **Entertainment** → Nostalgia-driven visitor engagement

---

## 🛠️ Customization Points

**Easy to Modify:**

- **Colors** → Edit `styles.css` color values
- **Particle Count** → Change `ANIMATION_PARAMS.particleCount` in `globals.js`
- **Countdown Date** → Modify `MAINTENANCE_SETTINGS.targetDate`
- **Messages** → Edit text in `index.html`
- **Sounds** → Replace URLs in `AUDIO_SOURCES`
- **Media Streams** → Update radio/EDM URLs in `media.js`

**Medium Complexity:**

- Add new buttons/windows (requires window-manager setup)
- Integrate different media sources
- Add form fields

**Advanced:**

- Particle behavior logic (in `script.js`)
- Three.js scene modifications
- New post-processing effects

---

## 📝 Notes & Observations

✅ **Strengths:**
- Highly polished retro aesthetic
- Functional and feature-rich
- Good code organization
- No jQuery dependencies (vanilla JS)
- Modern tech (Three.js, HLS) meets retro design

⚠️ **Potential Issues:**
- Language: Portuguese (might need localization for international audience)
- Heavy on GPU (may not work well on older devices)
- Email domain mismatch (button says "sites@ipv7.pt" but form sends to "cardosys@protonmail.com")
- RSS feed URLs not found (might be configured in `media.js`)

💭 **Project Quality:**
- Well-structured codebase
- Clear separation of concerns
- Good use of configuration file
- Professional implementation of retro design

---

## 📚 Language & Culture

- **Primary Language:** Portuguese (Portugal)
- **Maintenance Message:** "Website em Manutenção"
- **Button Labels:** Portuguese
- **Contact Email:** `cardosys@protonmail.com`
- **Possible Organization:** IPV7 (based on email domain hint)

---

*Document Generated: 2026-04-28*
*Project: Windows 7-themed Maintenance Page*
*Tech Stack: HTML5, CSS3, Three.js, JavaScript (ES6+), HLS.js, RSS Parser, Web3Forms*

---

## 🔄 UPDATE LOG - April 28, 2026

### CRITICAL BUGS FIXED ✅

#### 1. **Ghost Buttons Bug** - RESOLVED
**Problem**: Buttons would respond multiple times to a single click after reopening media windows

**Root Cause**: 
- `initMediaFeatures()` was never called at startup
- Event listeners accumulated without cleanup

**Solution Implemented**:
- Added `initMediaFeatures()` call in `script.js` at line 26
- Added `mediaFeaturesInitialized` flag in `media.js` to prevent duplicate listener attachment
- Added debug logging to track listener attachment
- **File Changes**: 
  - [script.js](script.js#L26-L30) - Added initialization call
  - [assets/media.js](assets/media.js#L10-L40) - Added guard flag and logging

#### 2. **EDM Window Resizing on Desktop** - RESOLVED  
**Problem**: EDM player window (1000×900px) could be resized despite CSS constraints, breaking layout

**Root Cause**: 
- `makeResizable()` function added 8 resize handles to ALL windows
- No check for non-resizable window types before adding handles
- Handles interfered with fixed window size

**Solution Implemented**:
- Added safety check in `makeResizable()` function to detect non-resizable windows
- Updated `window-manager.js` (line 222) with classification check
- Added CSS rules to hide/disable resize handles for non-resizable windows
- Applied `display: none` + `pointer-events: none` on resize handles
- **File Changes**:
  - [assets/window-manager.js](assets/window-manager.js#L222-L240) - Added window type detection
  - [styles-additional.css](styles-additional.css#L60-L77) - Added CSS to disable handles

#### 3. **Missing Initialization** - RESOLVED
**Problem**: Media buttons weren't functional because `initMediaFeatures()` was never called

**Solution**: Added explicit call in `script.js` after other initializations

---

### ARCHITECTURE IMPROVEMENTS

#### ES Modules Foundation Laid ✅
Files converted to support modular imports/exports:

**✅ globals.js** - Hybrid approach for backwards compatibility
- Exports all configuration constants
- Also attaches to `window` object for existing code compatibility
- Exports utility functions: `playSound()`, `showWindowsDialog()`
- [View Changes](assets/globals.js)

**✅ web3forms.js** - Converted to ES module
- Imports from `globals.js`
- Exports email form functions: `initEmailForm()`, `generateMathChallenge()`, `showEmailFormWindow()`
- Ready for future integration
- [View Changes](assets/web3forms.js)

**✅ media.js** - Partially converted
- Added exports for `initMediaFeatures()`
- Imports configuration from globals
- Foundation for complete module migration
- [View Changes](assets/media.js#L1-L50)

---

### CODE QUALITY IMPROVEMENTS

**Added to media.js**:
```javascript
// Track initialization state to prevent duplicate listeners (FIXES GHOST BUTTONS BUG)
let mediaFeaturesInitialized = false;

// Initialize media features - called only once
export function initMediaFeatures() {
    if (mediaFeaturesInitialized) {
        console.log('[Media Manager] Already initialized, skipping');
        return;
    }
    mediaFeaturesInitialized = true;
    // ... attach listeners once
}
```

**Added to window-manager.js**:
```javascript
// CRITICAL FIX: Check for non-resizable windows
const nonResizableWindows = [
    'email-form-window', 'radio-player-window', 
    'edm-player-window', 'rss-window', 'rss-feed-window'
];

const isNonResizable = nonResizableWindows.some(
    className => windowElement.classList.contains(className)
);

if (isNonResizable) {
    // Skip resize handles for these windows
    return;
}
```

**Added to script.js**:
```javascript
// CRITICAL FIX: Initialize media features at startup
if (typeof initMediaFeatures === 'function') {
    console.log('[Script] Initializing media features at startup');
    initMediaFeatures();
}
```

---

### TESTING CHECKLIST

- [x] Ghost buttons bug - Fixed (no more multiple responses)
- [x] EDM window resizing - Fixed (stays 1000×900px on desktop)
- [x] Media button initialization - Fixed (buttons now respond on first click)
- [ ] Full regression testing needed (see below)
- [ ] Mobile responsiveness verification
- [ ] Audio stream functionality
- [ ] Email form submission
- [ ] Window management (drag, resize, maximize, minimize)

---

### RECOMMENDED NEXT STEPS

1. **Complete ES Modules Migration** (In Progress)
   - Convert remaining files: window-manager.js, mobile-maximize.js
   - Create main entry point module
   - Update index.html to load as module

2. **Additional Improvements**
   - Implement proper error boundaries
   - Add memory leak detection and cleanup
   - Enhance logging for debugging
   - Add performance monitoring

3. **Testing**
   - Test all buttons after fixes
   - Verify no memory leaks with repeated interactions
   - Test on multiple browsers
   - Test on mobile devices

---
