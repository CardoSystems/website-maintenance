// ============================================================================
// globals.js - Configuration and utilities
// Exports for ES modules + global declarations for backwards compatibility
// ============================================================================

// Animation and rendering parameters
export const ANIMATION_PARAMS = {
  expansionSpeed: 50,
  particleSize: 2,
  bloomStrength: 2,
  bloomRadius: 0.5,
  bloomThreshold: 0,
  particleCount: 20000
};

// Backwards compatibility - attach to window
window.ANIMATION_PARAMS = ANIMATION_PARAMS;

// Maintenance countdown settings
export const MAINTENANCE_SETTINGS = {
  targetDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).getTime(),
  progressUpdateInterval: 800,
  progressInitialMin: 15,
  progressInitialMax: 45
};

window.MAINTENANCE_SETTINGS = MAINTENANCE_SETTINGS;

// Audio settings
export const AUDIO_SOURCES = {
  startSound: 'https://www.myinstants.com/media/sounds/windows-xp-ding.mp3',
  successSound: 'https://www.myinstants.com/media/sounds/windows-xp-shutdown.mp3',
  errorSound: 'https://www.myinstants.com/media/sounds/windows-xp-error.mp3',
  volume: 0.3
};

window.AUDIO_SOURCES = AUDIO_SOURCES;

// Form settings
export const FORM_SETTINGS = {
  apiEndpoint: 'https://api.web3forms.com/submit',
  accessKey: 'fb0a6e6b-bba1-4bb2-9fc7-36bdf7b33edf',
};

window.FORM_SETTINGS = FORM_SETTINGS;

/**
 * Play a sound effect
 */
export function playSound(soundUrl, volume = AUDIO_SOURCES.volume) {
  try {
    const sound = new Audio(soundUrl);
    sound.volume = volume;
    sound.play().catch(err => {
      console.log('Audio play failed:', err.message);
    });
  } catch (err) {
    console.log('Audio error:', err.message);
  }
}

window.playSound = playSound;

/**
 * Show Windows 7 style dialog
 */
export function showWindowsDialog(title, message) {
  const dialogOverlay = document.createElement('div');
  dialogOverlay.className = 'dialog-overlay';

  const dialogWindow = document.createElement('div');
  dialogWindow.className = 'window dialog';

  const titleBar = document.createElement('div');
  titleBar.className = 'title-bar';

  const titleText = document.createElement('div');
  titleText.className = 'title-bar-text';
  titleText.textContent = title;

  const titleControls = document.createElement('div');
  titleControls.className = 'title-bar-controls';

  const closeBtn = document.createElement('button');
  closeBtn.setAttribute('aria-label', 'Close');

  const windowBody = document.createElement('div');
  windowBody.className = 'window-body';

  const messageText = document.createElement('p');
  messageText.textContent = message;

  const buttonSection = document.createElement('section');
  buttonSection.className = 'field-row field-row-last';

  const okButton = document.createElement('button');
  okButton.textContent = 'OK';

  titleControls.appendChild(closeBtn);
  titleBar.appendChild(titleText);
  titleBar.appendChild(titleControls);

  windowBody.appendChild(messageText);
  buttonSection.appendChild(okButton);
  windowBody.appendChild(buttonSection);

  dialogWindow.appendChild(titleBar);
  dialogWindow.appendChild(windowBody);

  dialogOverlay.appendChild(dialogWindow);
  document.body.appendChild(dialogOverlay);

  dialogWindow.style.position = 'absolute';
  dialogWindow.style.top = '50%';
  dialogWindow.style.left = '50%';
  dialogWindow.style.transform = 'translate(-50%, -50%)';

  let isDragging = false;
  let offsetX, offsetY;

  function closeDialog() {
    try {
      if (dialogOverlay.parentNode && dialogOverlay.parentNode.contains(dialogOverlay)) {
        dialogOverlay.parentNode.removeChild(dialogOverlay);
      } else if (typeof dialogOverlay.remove === 'function') {
        dialogOverlay.remove();
      }
    } catch (err) {
      console.warn('[Globals] Failed to remove dialog overlay:', err);
    }
    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', upHandler);
    dialogOverlay.removeEventListener('click', overlayClickHandler);
    okButton.removeEventListener('click', closeDialog);
    closeBtn.removeEventListener('click', closeDialog);
  }

  function moveHandler(e) {
    if (!isDragging) return;
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    dialogWindow.style.left = x + 'px';
    dialogWindow.style.top = y + 'px';
    dialogWindow.style.transform = 'none';
  }

  function upHandler() {
    if (!isDragging) return;
    isDragging = false;
    titleBar.style.cursor = 'move';
  }

  function overlayClickHandler(e) {
    if (e.target === dialogOverlay) {
      closeDialog();
    }
  }

  titleBar.addEventListener('mousedown', function(e) {
    if (e.target.tagName === 'BUTTON') return;
    isDragging = true;
    const rect = dialogWindow.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    dialogWindow.style.transition = 'none';
    titleBar.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('mouseup', upHandler);
  dialogOverlay.addEventListener('click', overlayClickHandler);
  okButton.addEventListener('click', closeDialog);
  closeBtn.addEventListener('click', closeDialog);
}

window.showWindowsDialog = showWindowsDialog;
