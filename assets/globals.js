// --------------------------------------------------------------------------------
// globals.js - Global variables and settings for the Windows 7 maintenance page
// --------------------------------------------------------------------------------

// Animation and rendering parameters
const ANIMATION_PARAMS = {
  expansionSpeed: 50,     // Scales how fast the particles expand
  particleSize: 2,        // Particle point size
  bloomStrength: 2,       // Bloom effect strength
  bloomRadius: 0.5,       // Bloom effect radius
  bloomThreshold: 0,      // Bloom effect threshold
  particleCount: 20000    // Number of particles for the Big Bang explosion
};

// Maintenance countdown settings
const MAINTENANCE_SETTINGS = {
  targetDate: new Date('August 15, 2025 00:00:00').getTime(),
  progressUpdateInterval: 800,  // Milliseconds between progress updates
  progressInitialMin: 15,       // Minimum starting progress percentage
  progressInitialMax: 45        // Maximum starting progress percentage
};

// Audio settings and sources
const AUDIO_SOURCES = {
  startSound: 'https://www.myinstants.com/media/sounds/windows-xp-ding.mp3',
  successSound: 'https://www.myinstants.com/media/sounds/windows-xp-shutdown.mp3',
  errorSound: 'https://www.myinstants.com/media/sounds/windows-xp-error.mp3',
  volume: 0.3
};

// Form settings
const FORM_SETTINGS = {
  apiEndpoint: 'https://api.web3forms.com/submit',
  accessKey: '29a12530-1034-4d1e-8575-d72d8d916abf',
  cloudflareKey: '0x4AAAAAABoph6l8jAkFimWx',
  cloudflareSecretKey: '0x4AAAAAABoph5HWfo3upLuQOOkUbShvAk8'
};
