// --------------------------------------------------------------------------------
// Global variables for scene, camera, renderer, controls, and simulation objects.
// --------------------------------------------------------------------------------
let scene, camera, renderer, controls, composer;
let particleSystem, particlePositions, particleVelocities;
let galaxySystem = null; // Will hold the galaxy cluster (added later)
let nebula = null; // Will hold the nebula background (added later)
let particleCount = ANIMATION_PARAMS.particleCount; // Number of particles from globals.js
let params = ANIMATION_PARAMS; // Initialize params with defaults from globals.js
let clock = new THREE.Clock(); // Clock to keep track of elapsed time

// Maintenance countdown variables
const targetDate = MAINTENANCE_SETTINGS.targetDate;
let countdownInterval;
let progressInterval;
let progressValue = 0;

// Initialize the scene and start the animation loop.
init();
animate();
initCountdown();
initWindowsButtons();
animateProgress();
makeDraggable();

// --------------------------------------------------------------------------------
// Function: animateProgress()
// Animates the Windows 7 progress bar realistically
// --------------------------------------------------------------------------------
function animateProgress() {
  const progressBar = document.querySelector('.win7-progress-green');
  const progressPercent = document.getElementById('progress-percent');
  
  if (!progressBar || !progressPercent) return;
  
  // Start with random progress using globals settings
  progressValue = Math.floor(Math.random() * 
    (MAINTENANCE_SETTINGS.progressInitialMax - MAINTENANCE_SETTINGS.progressInitialMin)) + 
    MAINTENANCE_SETTINGS.progressInitialMin;
  updateProgressBar();
  
  // Set interval to update progress
  progressInterval = setInterval(() => {
    // Calculate how much to increase - slower near the end
    let increment;
    if (progressValue < 60) {
      increment = Math.random() * 2 + 0.5; // Faster at the beginning
    } else if (progressValue < 85) {
      increment = Math.random() * 1 + 0.2; // Medium pace
    } else {
      increment = Math.random() * 0.3 + 0.05; // Very slow at the end
    }
    
    // Sometimes pause or speed up for realism
    if (Math.random() > 0.9) {
      // Pause for a bit
      clearInterval(progressInterval);
      setTimeout(() => {
        progressInterval = setInterval(() => {
          progressValue += Math.random() * 0.5 + 0.1;
          if (progressValue > 99) progressValue = 99; // Never quite reach 100%
          updateProgressBar();
        }, MAINTENANCE_SETTINGS.progressUpdateInterval);
      }, Math.random() * 3000 + 1000);
    } else {
      progressValue += increment;
      if (progressValue > 99) progressValue = 99; // Never quite reach 100%
      updateProgressBar();
    }
  }, MAINTENANCE_SETTINGS.progressUpdateInterval);
}

function updateProgressBar() {
  const progressBar = document.querySelector('.win7-progress-green');
  const progressPercent = document.getElementById('progress-percent');
  const remainingItems = document.querySelector('.win7-progress-details span:nth-child(2)');
  const currentSpeed = document.querySelector('.win7-progress-details span:nth-child(3)');
  
  if (progressBar) {
    progressBar.style.width = progressValue + '%';
  }
  
  if (progressPercent) {
    progressPercent.textContent = Math.floor(progressValue) + '% completo';
  }
  
  // Update fake remaining items count
  if (remainingItems) {
    const itemsLeft = Math.floor((100 - progressValue) * 50) + Math.floor(Math.random() * 20);
    remainingItems.textContent = `Itens restantes: ${itemsLeft.toLocaleString('pt-PT')} ficheiros`;
  }
  
  // Update fake speed
  if (currentSpeed) {
    const speed = (Math.random() * 3 + 1).toFixed(1);
    currentSpeed.textContent = `Velocidade atual: ${speed.replace('.', ',')} MB/s`;
  }
}

// --------------------------------------------------------------------------------
// Function: initWindowsButtons()
// Set up event listeners for Windows 7 style buttons and controls
// --------------------------------------------------------------------------------
function initWindowsButtons() {
  // Close button functionality (in title bar)
  const closeButton = document.querySelector('.title-bar-controls button[aria-label="Close"]');
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      const mainWindow = document.querySelector('.window');
      if (mainWindow) {
        mainWindow.style.display = 'none';
      }
    });
  }

  // Minimize button functionality
  const minimizeButton = document.querySelector('.title-bar-controls button[aria-label="Minimize"]');
  if (minimizeButton) {
    minimizeButton.addEventListener('click', function() {
      const mainWindow = document.querySelector('.window');
      if (mainWindow) {
        if (mainWindow.classList.contains('minimized')) {
          mainWindow.classList.remove('minimized');
        } else {
          mainWindow.classList.add('minimized');
          setTimeout(() => {
            mainWindow.classList.remove('minimized');
          }, 2000);
        }
      }
    });
  }
  
  // Maximize button functionality
  const maximizeButton = document.querySelector('.title-bar-controls button[aria-label="Maximize"]');
  if (maximizeButton) {
    maximizeButton.addEventListener('click', function() {
      const mainWindow = document.querySelector('.window');
      if (mainWindow) {
        if (mainWindow.classList.contains('maximized')) {
          mainWindow.classList.remove('maximized');
          mainWindow.style.width = '600px';
          mainWindow.style.height = 'auto';
          // Reset position when un-maximizing
          mainWindow.style.top = '50%';
          mainWindow.style.left = '50%';
          mainWindow.style.transform = 'translate(-50%, -50%)';
        } else {
          mainWindow.classList.add('maximized');
          mainWindow.style.width = '90%';
          mainWindow.style.height = '80%';
          // Center the maximized window
          mainWindow.style.top = '50%';
          mainWindow.style.left = '50%';
          mainWindow.style.transform = 'translate(-50%, -50%)';
        }
      }
    });
  }

  // Details button functionality
  const detailsButton = document.getElementById('details-btn');
  if (detailsButton) {
    detailsButton.addEventListener('click', function() {
      showWindowsDialog(
        'Detalhes da Manutenção', 
        'O website está atualmente em manutenção programada para melhorar o desempenho e a segurança. ' +
        'Talvez acabe o website ou faça uma nova versão. ' +
        'Pedimos desculpa por qualquer inconveniente causado.'
      );
    });
  }

  // Retry button functionality
  const retryButton = document.getElementById('retry-btn');
  if (retryButton) {
    retryButton.addEventListener('click', function() {
      // Simulate a retry by pausing and restarting the progress animation
      const progressBar = document.querySelector('.win7-progress-green');
      if (progressBar) {
        clearInterval(progressInterval);
        progressBar.style.width = '0%';
        
        showWindowsDialog(
          'Tentativa de Conexão', 
          'A tentar reconectar ao servidor...\n\nServidor ainda em manutenção. Por favor, tente novamente mais tarde.'
        );
        
        setTimeout(() => {
          // Reset progress and restart animation
          progressValue = Math.floor(Math.random() * 20);
          updateProgressBar();
          animateProgress();
        }, 2000);
      }
    });
  }
}

// --------------------------------------------------------------------------------
// Function: makeDraggable()
// Makes the Windows 7 window draggable by the title bar
// --------------------------------------------------------------------------------
function makeDraggable() {
  const window = document.querySelector('.window');
  const titleBar = document.querySelector('.title-bar');
  
  if (!window || !titleBar) return;
  
  // Set initial positioning for the window
  window.style.position = 'absolute';
  window.style.top = '50%';
  window.style.left = '50%';
  window.style.transform = 'translate(-50%, -50%)';
  
  let isDragging = false;
  let offsetX, offsetY;
  
  // Mouse down event on title bar starts dragging
  titleBar.addEventListener('mousedown', function(e) {
    // Don't initiate drag if clicking on a control button
    if (e.target.tagName === 'BUTTON') return;
    
    isDragging = true;
    
    // Calculate the offset from the mouse position to the window position
    const rect = window.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    // Add a subtle transition when dragging starts
    window.style.transition = 'none';
    
    // Change cursor to grabbing
    titleBar.style.cursor = 'grabbing';
    
    // Prevent text selection during drag
    e.preventDefault();
  });
  
  // Mouse move event handles the dragging
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    
    // Calculate new position
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    // Update window position
    window.style.left = x + 'px';
    window.style.top = y + 'px';
    window.style.transform = 'none';
  });
  
  // Mouse up event ends dragging
  document.addEventListener('mouseup', function() {
    if (!isDragging) return;
    
    isDragging = false;
    
    // Reset cursor
    titleBar.style.cursor = 'move';
    
    // Add a subtle transition when dragging ends
    window.style.transition = 'box-shadow 0.2s ease';
  });
  
  // Handle mouse leaving the window
  document.addEventListener('mouseleave', function() {
    if (isDragging) {
      isDragging = false;
      titleBar.style.cursor = 'move';
    }
  });
}

// --------------------------------------------------------------------------------
// Function: showWindowsDialog()
// Creates and displays a Windows 7 style dialog popup
// --------------------------------------------------------------------------------
function showWindowsDialog(title, message) {
  // Create dialog elements
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
  
  // Assemble the dialog
  titleControls.appendChild(closeBtn);
  titleBar.appendChild(titleText);
  titleBar.appendChild(titleControls);
  
  windowBody.appendChild(messageText);
  
  buttonSection.appendChild(okButton);
  windowBody.appendChild(buttonSection);
  
  dialogWindow.appendChild(titleBar);
  dialogWindow.appendChild(windowBody);
  
  dialogOverlay.appendChild(dialogWindow);
  
  // Add dialog to the document
  document.body.appendChild(dialogOverlay);
  
  // Set initial position
  dialogWindow.style.position = 'absolute';
  dialogWindow.style.top = '50%';
  dialogWindow.style.left = '50%';
  dialogWindow.style.transform = 'translate(-50%, -50%)';
  
  // Variables for drag functionality
  let isDragging = false;
  let offsetX, offsetY;
  
  // Function to close the dialog and clean up event listeners
  function closeDialog() {
    document.body.removeChild(dialogOverlay);
    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', upHandler);
    dialogOverlay.removeEventListener('click', overlayClickHandler);
    okButton.removeEventListener('click', closeDialog);
    closeBtn.removeEventListener('click', closeDialog);
  }
  
  // Event handlers with named functions so they can be removed
  function moveHandler(e) {
    if (!isDragging) return;
    
    // Calculate new position
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    // Update window position
    dialogWindow.style.left = x + 'px';
    dialogWindow.style.top = y + 'px';
    dialogWindow.style.transform = 'none';
  }
  
  function upHandler() {
    if (!isDragging) return;
    
    isDragging = false;
    
    // Reset cursor
    titleBar.style.cursor = 'move';
  }
  
  function overlayClickHandler(e) {
    if (e.target === dialogOverlay) {
      closeDialog();
    }
  }
  
  // Mouse down event on title bar starts dragging
  titleBar.addEventListener('mousedown', function(e) {
    // Don't initiate drag if clicking on a control button
    if (e.target.tagName === 'BUTTON') return;
    
    isDragging = true;
    
    // Calculate the offset from the mouse position to the window position
    const rect = dialogWindow.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    // Remove transition while dragging
    dialogWindow.style.transition = 'none';
    
    // Change cursor to grabbing
    titleBar.style.cursor = 'grabbing';
    
    // Prevent text selection during drag
    e.preventDefault();
  });
  
  // Add event listeners
  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('mouseup', upHandler);
  dialogOverlay.addEventListener('click', overlayClickHandler);
  okButton.addEventListener('click', closeDialog);
  closeBtn.addEventListener('click', closeDialog);
}

// --------------------------------------------------------------------------------
// Function: init()
// Sets up the scene, camera, renderer, lights, particle system, post-processing, etc.
// --------------------------------------------------------------------------------
function init() {
  // Create a new scene.
  scene = new THREE.Scene();

  // Create a perspective camera.
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.set(0, 0, 200);

  // Create the WebGL renderer with antialiasing and set its size.
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true; // Enable shadow maps for added realism.
  document.body.appendChild(renderer.domElement);

  // Add OrbitControls so the user can explore the scene.
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Smooth out camera movement.
  controls.dampingFactor = 0.05;
  controls.enableZoom = false; // Disable zoom for better user experience
  controls.autoRotate = true; // Auto-rotate for a more dynamic view
  controls.autoRotateSpeed = 0.5;

  // Add ambient light to gently light the scene.
  const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
  scene.add(ambientLight);

  // Add a point light at the origin to simulate the intense energy of the Big Bang.
  const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
  pointLight.position.set(0, 0, 0);
  pointLight.castShadow = true;
  scene.add(pointLight);

  // Set up post-processing using EffectComposer and add a bloom pass to simulate volumetric light.
  composer = new THREE.EffectComposer(renderer);
  let renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);
  let bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, // strength
    0.4, // radius
    0.85 // threshold
  );
  bloomPass.threshold = 0;
  bloomPass.strength = 2;
  bloomPass.radius = 0.5;
  composer.addPass(bloomPass);

  // Create the primary particle system representing the initial Big Bang explosion.
  createParticleSystem();

  // Hide dat.GUI for the maintenance page to keep it clean
  // setupGUI();

  // Listen for window resize events.
  window.addEventListener("resize", onWindowResize, false);
}

// --------------------------------------------------------------------------------
// Function: createParticleSystem()
// Creates a particle system where all particles originate at the singularity and
// are assigned random velocities that will cause them to expand outward.
// --------------------------------------------------------------------------------
function createParticleSystem() {
  // Create a BufferGeometry to store particle positions.
  const geometry = new THREE.BufferGeometry();

  // Allocate arrays for particle positions and velocities.
  particlePositions = new Float32Array(particleCount * 3);
  particleVelocities = new Float32Array(particleCount * 3);

  // Initialize each particle at (0,0,0) with a random outward velocity.
  for (let i = 0; i < particleCount; i++) {
    // All particles start at the singularity (with a tiny offset if desired).
    particlePositions[i * 3] = 0;
    particlePositions[i * 3 + 1] = 0;
    particlePositions[i * 3 + 2] = 0;

    // Randomly determine the particle's direction (spherical coordinates).
    let theta = Math.random() * 2 * Math.PI;
    let phi = Math.acos(Math.random() * 2 - 1);
    let speed = Math.random() * 0.5 + 0.5; // Speed between 0.5 and 1.0.
    particleVelocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
    particleVelocities[i * 3 + 1] =
      speed * Math.sin(phi) * Math.sin(theta);
    particleVelocities[i * 3 + 2] = speed * Math.cos(phi);
  }

  // Attach the positions to the geometry.
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3)
  );

  // Create a PointsMaterial using a custom sprite texture for a soft glow.
  const sprite = generateSprite();
  const material = new THREE.PointsMaterial({
    size: 2,
    map: sprite,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    opacity: 0.8,
    color: 0xffffff,
  });

  // Create the particle system and add it to the scene.
  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
}

// --------------------------------------------------------------------------------
// Function: generateSprite()
// Generates a circular, glowing sprite texture using the canvas element.
// --------------------------------------------------------------------------------
function generateSprite() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");

  // Create a radial gradient for the glow.
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.2, "rgba(255, 200, 200, 0.8)");
  gradient.addColorStop(0.4, "rgba(200, 100, 100, 0.6)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);

  // Create and return a texture from the canvas.
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// --------------------------------------------------------------------------------
// Function: setupGUI()
// Sets up a dat.GUI panel to let users control simulation parameters.
// --------------------------------------------------------------------------------
function setupGUI() {
  // Define default parameters.
  params = {
    expansionSpeed: 50, // Scales how fast the particles expand.
    particleSize: 2, // Particle point size.
    bloomStrength: 2, // Bloom effect strength.
    bloomRadius: 0.5, // Bloom effect radius.
    bloomThreshold: 0, // Bloom effect threshold.
  };

  // Create a GUI panel.
  const gui = new dat.GUI({ width: 300 });
  gui.add(params, "expansionSpeed", 10, 200).name("Expansion Speed");
  gui
    .add(params, "particleSize", 1, 10)
    .name("Particle Size")
    .onChange((value) => {
      particleSystem.material.size = value;
    });
  gui
    .add(params, "bloomStrength", 0, 5)
    .name("Bloom Strength")
    .onChange((value) => {
      composer.passes[1].strength = value;
    });
  gui
    .add(params, "bloomRadius", 0, 1)
    .name("Bloom Radius")
    .onChange((value) => {
      composer.passes[1].radius = value;
    });
  gui
    .add(params, "bloomThreshold", 0, 1)
    .name("Bloom Threshold")
    .onChange((value) => {
      composer.passes[1].threshold = value;
    });
}

// --------------------------------------------------------------------------------
// Function: onWindowResize()
// Adjusts the camera aspect ratio and renderer size when the browser window resizes.
// --------------------------------------------------------------------------------
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

// --------------------------------------------------------------------------------
// Function: animate()
// The main animation loop: updates particle positions, adds additional cosmic
// elements as time progresses, and renders the scene.
// --------------------------------------------------------------------------------
function animate() {
  requestAnimationFrame(animate);

  // Compute the time elapsed since the last frame.
  const delta = clock.getDelta();

  // Update the positions of the explosion particles.
  updateParticles(delta);

  // Gradually add additional elements to the universe:
  // After 10 seconds, add a galaxy cluster; after 15 seconds, add a nebula.
  let elapsed = clock.elapsedTime;
  if (elapsed > 10 && !galaxySystem) {
    createGalaxyCluster();
  }
  if (elapsed > 15 && !nebula) {
    createNebula();
  }

  // Update camera controls.
  controls.update();

  // Render the scene using the post-processing composer (which includes bloom).
  composer.render(delta);
}

// --------------------------------------------------------------------------------
// Function: updateParticles()
// Moves each particle outward from the center by updating its position based on
// its velocity and the user-controlled expansion speed.
// --------------------------------------------------------------------------------
function updateParticles(delta) {
  // Use the expansion speed from the global params
  const expansionSpeed = params.expansionSpeed;
  
  const positions = particleSystem.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    let index = i * 3;
    positions[index] +=
      particleVelocities[index] * expansionSpeed * delta;
    positions[index + 1] +=
      particleVelocities[index + 1] * expansionSpeed * delta;
    positions[index + 2] +=
      particleVelocities[index + 2] * expansionSpeed * delta;
  }
  particleSystem.geometry.attributes.position.needsUpdate = true;
}

// --------------------------------------------------------------------------------
// Function: createGalaxyCluster()
// Creates a secondary particle system to simulate the appearance of galaxies and
// star clusters in the later universe.
// --------------------------------------------------------------------------------
function createGalaxyCluster() {
  const galaxyCount = 5000; // Number of galaxy particles
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(galaxyCount * 3);

  // Randomly distribute galaxy particles in a large spherical region.
  for (let i = 0; i < galaxyCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
  }
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  // Create a PointsMaterial for the galaxy cluster with smaller, fainter points.
  const material = new THREE.PointsMaterial({
    size: 1.5,
    color: 0xaaaaaa,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.5,
    depthTest: false,
  });

  // Create the galaxy particle system and add it to the scene.
  galaxySystem = new THREE.Points(geometry, material);
  scene.add(galaxySystem);
}

// --------------------------------------------------------------------------------
// Function: createNebula()
// Creates a large, semi-transparent sphere with a custom-generated texture to
// simulate a nebula that forms as the universe expands.
// --------------------------------------------------------------------------------
function createNebula() {
  const nebulaGeometry = new THREE.SphereGeometry(500, 32, 32);
  const nebulaMaterial = new THREE.MeshBasicMaterial({
    map: generateNebulaTexture(),
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.7,
  });
  nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
  scene.add(nebula);
}

// --------------------------------------------------------------------------------
// Function: generateNebulaTexture()
// Uses canvas drawing to create a nebula-like texture with a radial gradient and
// random noise to simulate stars and gaseous clouds.
// --------------------------------------------------------------------------------
function generateNebulaTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  // Create a radial gradient as the base of the nebula.
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    size / 8,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(50, 0, 100, 0.8)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  // Add random noise dots to simulate stars and gas.
  for (let i = 0; i < 1000; i++) {
    context.fillStyle = "rgba(255,255,255," + Math.random() * 0.1 + ")";
    const x = Math.random() * size;
    const y = Math.random() * size;
    context.fillRect(x, y, 1, 1);
  }
  return new THREE.CanvasTexture(canvas);
}

// --------------------------------------------------------------------------------
// Function: initCountdown()
// Initializes and updates the maintenance countdown timer
// --------------------------------------------------------------------------------
function initCountdown() {
  // Update the countdown every second
  countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown(); // Initial update
}

// --------------------------------------------------------------------------------
// Function: updateCountdown()
// Updates the countdown timer display
// --------------------------------------------------------------------------------
function updateCountdown() {
  const timerElement = document.getElementById('timer');
  const now = new Date().getTime();
  const timeRemaining = targetDate - now;

  if (timeRemaining <= 0) {
    // If the target date has passed
    clearInterval(countdownInterval);
    if (timerElement) {
      timerElement.innerHTML = "Conclusão: 99%";
    }
    return;
  }

  // Calculate time units
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  // Display the countdown in Windows 7 format in Portuguese
  if (timerElement) {
    timerElement.innerHTML = `Tempo restante: ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  
  // Also update the file transfer animation details with the remaining time
  const transferTimeRemaining = document.querySelector('.win7-progress-details span:first-child');
  if (transferTimeRemaining) {
    transferTimeRemaining.textContent = `Tempo restante: cerca de ${days}d ${hours}h ${minutes}m`;
  }
}

// --------------------------------------------------------------------------------
// Function: makeDialogDraggable()
// Makes any dialog window draggable by its title bar
// --------------------------------------------------------------------------------
function makeDialogDraggable(dialogWindow, titleBar) {
  if (!dialogWindow || !titleBar) return;
  
  let isDragging = false;
  let offsetX, offsetY;
  
  // Mouse down event on title bar starts dragging
  titleBar.addEventListener('mousedown', function(e) {
    // Don't initiate drag if clicking on a control button
    if (e.target.tagName === 'BUTTON') return;
    
    isDragging = true;
    
    // Calculate the offset from the mouse position to the window position
    const rect = dialogWindow.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    // Add a subtle transition when dragging starts
    dialogWindow.style.transition = 'none';
    
    // Change cursor to grabbing
    titleBar.style.cursor = 'grabbing';
    
    // Prevent text selection during drag
    e.preventDefault();
  });
  
  // Mouse move event handles the dragging
  function moveHandler(e) {
    if (!isDragging) return;
    
    // Calculate new position
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    // Update window position
    dialogWindow.style.left = x + 'px';
    dialogWindow.style.top = y + 'px';
    dialogWindow.style.transform = 'none';
  }
  
  // Mouse up event ends dragging
  function upHandler() {
    if (!isDragging) return;
    
    isDragging = false;
    
    // Reset cursor
    titleBar.style.cursor = 'move';
    
    // Add a subtle transition when dragging ends
    dialogWindow.style.transition = 'box-shadow 0.2s ease';
  }
  
  // Add event listeners
  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('mouseup', upHandler);
  
  // Remove event listeners when window is closed
  dialogWindow.addEventListener('DOMNodeRemoved', function() {
    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', upHandler);
  });
}