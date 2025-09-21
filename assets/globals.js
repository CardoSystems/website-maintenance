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
  targetDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).getTime(), // 365 days from now
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
  accessKey: 'fb0a6e6b-bba1-4bb2-9fc7-36bdf7b33edf',
};
