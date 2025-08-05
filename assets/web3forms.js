// ------------------------------------------------------------------------------
// web3forms.js - Handles all functionality related to the Web3Forms email form
// ------------------------------------------------------------------------------

// Configuration
const WEB3FORMS_CONFIG = {
    apiKey: FORM_SETTINGS.accessKey,
    endpoint: FORM_SETTINGS.apiEndpoint,
    cloudflareKey: FORM_SETTINGS.cloudflareKey,
    hcaptchaKey: FORM_SETTINGS.hcaptchaKey,
    soundEffects: {
        open: "https://www.myinstants.com/media/sounds/windows-xp-startup.mp3",
        send: AUDIO_SOURCES.startSound,
        success: AUDIO_SOURCES.successSound,
        error: AUDIO_SOURCES.errorSound,
        typing: "https://www.myinstants.com/media/sounds/windows-xp-pop.mp3",
        volume: AUDIO_SOURCES.volume
    }
};

// Captcha token variables
let turnstileToken = null;
let hcaptchaToken = null;
let captchaType = 'turnstile'; // Default to Turnstile, will fallback to hCaptcha if needed

// Initialize the email form functionality
function initEmailForm() {
    // Add event listener for the "Enviar Email" button
    const emailButton = document.getElementById('email-btn');
    if (emailButton) {
        emailButton.addEventListener('click', showEmailFormWindow);
    }

    // Both scripts are now preloaded in HTML, so we just need to check which one is available
    setupCaptchaAvailability();
}

// Setup captcha availability check
function setupCaptchaAvailability() {
    // Set a timeout to check if Turnstile is available, otherwise use hCaptcha
    setTimeout(() => {
        if (typeof window.turnstile === 'undefined') {
            console.log('Cloudflare Turnstile not available. Using hCaptcha...');
            captchaType = 'hcaptcha';
        } else {
            console.log('Cloudflare Turnstile available and will be used.');
            captchaType = 'turnstile';
        }
    }, 2000); // Give scripts time to initialize
}

// Play a sound effect
function playSound(soundType) {
    try {
        const sound = new Audio(WEB3FORMS_CONFIG.soundEffects[soundType]);
        sound.volume = WEB3FORMS_CONFIG.soundEffects.volume;
        sound.play().catch(err => {
            console.log('Audio play failed (normal in some browsers):', err.message);
        });
    } catch (err) {
        console.log('Audio creation failed:', err.message);
    }
}

// Show typing animation effect (blinking cursor)
function showTypingEffect(element) {
    if (!element) return;
    
    element.classList.add('typing-effect');
    
    // Play typing sound effect at random intervals
    const typingInterval = setInterval(() => {
        if (Math.random() > 0.7) {
            playSound('typing');
        }
    }, 300);
    
    // Store the interval ID in the element's dataset for later cleanup
    element.dataset.typingInterval = typingInterval;
}

// Stop typing animation effect
function stopTypingEffect(element) {
    if (!element) return;
    
    element.classList.remove('typing-effect');
    
    // Clear the typing sound interval
    if (element.dataset.typingInterval) {
        clearInterval(element.dataset.typingInterval);
        delete element.dataset.typingInterval;
    }
}

// Show the email form window
function showEmailFormWindow() {
    // Play opening sound
    playSound('open');
    
    // Create the email form window elements
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'dialog-overlay';
    
    const dialogWindow = document.createElement('div');
    dialogWindow.className = 'window email-form-window';
    
    const titleBar = document.createElement('div');
    titleBar.className = 'title-bar';
    
    const titleText = document.createElement('div');
    titleText.className = 'title-bar-text';
    titleText.textContent = 'Contact Form - Windows 7';
    
    const titleControls = document.createElement('div');
    titleControls.className = 'title-bar-controls';
    
    const minimizeBtn = document.createElement('button');
    minimizeBtn.setAttribute('aria-label', 'Minimize');
    
    const maximizeBtn = document.createElement('button');
    maximizeBtn.setAttribute('aria-label', 'Maximize');
    
    const closeBtn = document.createElement('button');
    closeBtn.setAttribute('aria-label', 'Close');
    
    const windowBody = document.createElement('div');
    windowBody.className = 'window-body';
    
    // Create the form
    const form = document.createElement('form');
    form.id = 'web3-contact-form';
    form.className = 'win7-form';
    form.method = 'POST';
    
    // Form content HTML
    form.innerHTML = `
        <input type="hidden" name="access_key" value="${WEB3FORMS_CONFIG.apiKey}">
        <input type="hidden" name="subject" value="New message from Website Maintenance Page">
        <input type="hidden" name="from_name" value="Windows 7 Maintenance Form">
        
        <fieldset>
            <legend>Your Contact Information</legend>
            <div class="field-row">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required>
            </div>
            
            <div class="field-row">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="field-row">
                <label for="company">Company:</label>
                <input type="text" id="company" name="company">
            </div>
        </fieldset>
        
        <fieldset>
            <legend>Your Message</legend>
            <div class="field-row">
                <label for="subject">Subject:</label>
                <input type="text" id="subject" name="message-subject" required>
            </div>
            
            <div class="field-row vertical">
                <label for="message">Message:</label>
                <textarea id="message" name="message" rows="6" required></textarea>
            </div>
        </fieldset>
        
        <fieldset>
            <legend>Verification</legend>
            <div class="field-row verification-row">
                <!-- Turnstile container (default) -->
                <div id="turnstile-container" class="captcha-container">
                    <div class="cf-turnstile" data-sitekey="${WEB3FORMS_CONFIG.cloudflareKey}" data-callback="turnstileCallback"></div>
                </div>
                
                <!-- hCaptcha container (fallback) -->
                <div id="hcaptcha-container" class="captcha-container" style="display: none;">
                    <div class="h-captcha" data-sitekey="${WEB3FORMS_CONFIG.hcaptchaKey}" data-callback="hcaptchaCallback"></div>
                </div>
            </div>
        </fieldset>
        
        <div class="form-status" id="web3-form-status"></div>
        
        <section class="field-row field-row-last">
            <button type="submit" id="send-btn">Send Message</button>
            <button type="reset" id="reset-btn">Clear Form</button>
            <button type="button" id="cancel-btn">Cancel</button>
        </section>
    `;
    
    // Assemble the dialog
    titleControls.appendChild(minimizeBtn);
    titleControls.appendChild(maximizeBtn);
    titleControls.appendChild(closeBtn);
    
    titleBar.appendChild(titleText);
    titleBar.appendChild(titleControls);
    
    windowBody.appendChild(form);
    
    dialogWindow.appendChild(titleBar);
    dialogWindow.appendChild(windowBody);
    
    dialogOverlay.appendChild(dialogWindow);
    
    // Add the email form window to the document
    document.body.appendChild(dialogOverlay);
    
    // Set initial position
    dialogWindow.style.position = 'absolute';
    dialogWindow.style.top = '50%';
    dialogWindow.style.left = '50%';
    dialogWindow.style.transform = 'translate(-50%, -50%)';
    
    // Make the dialog draggable
    makeDialogDraggable(dialogWindow, titleBar);
    
    // Add event listeners
    closeBtn.addEventListener('click', () => closeEmailFormWindow(dialogOverlay));
    maximizeBtn.addEventListener('click', () => toggleMaximize(dialogWindow));
    minimizeBtn.addEventListener('click', () => minimizeWindow(dialogWindow));
    
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeEmailFormWindow(dialogOverlay));
    }
    
    // Setup the form submission
    setupFormSubmission(form);
    
    // Add focus and blur event listeners for typing effects
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => showTypingEffect(input));
        input.addEventListener('blur', () => stopTypingEffect(input));
    });
    
    // Apply special window open animation
    dialogWindow.classList.add('window-opening');
    setTimeout(() => {
        dialogWindow.classList.remove('window-opening');
        
        // Check and switch captcha after window is fully opened and visible
        setTimeout(() => {
            checkAndSwitchCaptcha();
        }, 300);
    }, 400);
}

// Make a dialog window draggable
function makeDialogDraggable(dialogWindow, titleBar) {
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
        
        // Remove transition while dragging
        dialogWindow.style.transition = 'none';
        
        // Change cursor to grabbing
        titleBar.style.cursor = 'grabbing';
        
        // Prevent text selection during drag
        e.preventDefault();
    });
    
    // Function for mouse move event (dragging)
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
    
    // Function for mouse up event (end dragging)
    function upHandler() {
        if (!isDragging) return;
        
        isDragging = false;
        
        // Reset cursor
        titleBar.style.cursor = 'move';
        
        // Restore transition
        dialogWindow.style.transition = '';
    }
    
    // Add event listeners
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    
    // Store the event listeners on the dialog window for later removal
    dialogWindow.moveHandler = moveHandler;
    dialogWindow.upHandler = upHandler;
}

// Toggle maximize state of the window
function toggleMaximize(dialogWindow) {
    if (dialogWindow.classList.contains('maximized')) {
        // Restore to previous size
        dialogWindow.classList.remove('maximized');
        dialogWindow.style.width = '';
        dialogWindow.style.height = '';
        dialogWindow.style.top = '50%';
        dialogWindow.style.left = '50%';
        dialogWindow.style.transform = 'translate(-50%, -50%)';
    } else {
        // Maximize
        dialogWindow.classList.add('maximized');
        dialogWindow.style.width = '90%';
        dialogWindow.style.height = '80%';
        dialogWindow.style.top = '10%';
        dialogWindow.style.left = '5%';
        dialogWindow.style.transform = 'none';
    }
}

// Minimize animation for the window
function minimizeWindow(dialogWindow) {
    dialogWindow.classList.add('minimized');
    
    // Restore after animation
    setTimeout(() => {
        dialogWindow.classList.remove('minimized');
    }, 300);
}

// Close the email form window
function closeEmailFormWindow(dialogOverlay) {
    const dialogWindow = dialogOverlay.querySelector('.window');
    
    // Remove event listeners to prevent memory leaks
    if (dialogWindow.moveHandler && dialogWindow.upHandler) {
        document.removeEventListener('mousemove', dialogWindow.moveHandler);
        document.removeEventListener('mouseup', dialogWindow.upHandler);
    }
    
    // Add closing animation
    dialogWindow.classList.add('window-closing');
    
    // Remove the overlay after animation completes
    setTimeout(() => {
        document.body.removeChild(dialogOverlay);
    }, 300);
}

// Setup form submission with Web3Forms
function setupFormSubmission(form) {
    const formStatus = document.getElementById('web3-form-status');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate captcha token based on current type
        let hasValidToken = false;
        if (captchaType === 'turnstile' && turnstileToken) {
            hasValidToken = true;
        } else if (captchaType === 'hcaptcha' && hcaptchaToken) {
            hasValidToken = true;
        }
        
        if (!hasValidToken) {
            formStatus.textContent = 'Please complete the CAPTCHA verification.';
            formStatus.className = 'form-status error';
            playSound('error');
            return;
        }
        
        // Clear previous status
        formStatus.textContent = 'Sending message...';
        formStatus.className = 'form-status sending';
        
        // Add the appropriate captcha token to form data
        const formData = new FormData(form);
        if (captchaType === 'turnstile' && turnstileToken) {
            formData.append('cf-turnstile-response', turnstileToken);
        } else if (captchaType === 'hcaptcha' && hcaptchaToken) {
            formData.append('h-captcha-response', hcaptchaToken);
        }
        
        // Play sending sound
        playSound('send');
        
        try {
            // Show Windows 7 sending animation
            const progressBar = document.createElement('div');
            progressBar.className = 'win7-progress';
            progressBar.innerHTML = `
                <div class="win7-progress-bar">
                    <div class="win7-progress-green sending-progress"></div>
                </div>
            `;
            formStatus.appendChild(progressBar);
            
            // Submit the form with a delay for effect
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Submit the form
            const response = await fetch(WEB3FORMS_CONFIG.endpoint, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Success message
                formStatus.innerHTML = '';
                formStatus.textContent = 'Message sent successfully!';
                formStatus.className = 'form-status success';
                
                // Reset the form
                form.reset();
                
                // Play success sound
                playSound('success');
                
                // Show success dialog after a moment
                setTimeout(() => {
                    showWindowsDialog(
                        'Message Sent', 
                        'Your message has been sent successfully. Our team will contact you shortly.'
                    );
                }, 1000);
                
                // Reset Captcha
                resetCaptcha();
            } else {
                throw new Error(data.message || 'Form submission failed');
            }
        } catch (error) {
            // Error message
            console.error('Form error:', error);
            formStatus.innerHTML = '';
            formStatus.textContent = 'Error sending message. Please try again.';
            formStatus.className = 'form-status error';
            
            // Play error sound
            playSound('error');
            
            // Show error dialog
            showWindowsDialog(
                'Error', 
                'There was an error sending your message. Please try again later.'
            );
        }
    });
    
    // Reset form button effect
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            formStatus.textContent = '';
            formStatus.className = 'form-status';
            
            // Reset Captcha
            resetCaptcha();
            
            // Add reset animation
            resetBtn.classList.add('clicked');
            setTimeout(() => {
                resetBtn.classList.remove('clicked');
            }, 200);
        });
    }
}

// Function to reset the current captcha
function resetCaptcha() {
    if (captchaType === 'turnstile' && window.turnstile) {
        window.turnstile.reset();
        turnstileToken = null;
    } else if (captchaType === 'hcaptcha' && window.hcaptcha) {
        window.hcaptcha.reset();
        hcaptchaToken = null;
    }
}

// Create and show a Windows 7 style dialog
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
    
    // Add opening animation
    dialogWindow.classList.add('dialog-opening');
    setTimeout(() => {
        dialogWindow.classList.remove('dialog-opening');
    }, 300);
    
    // Make the dialog draggable
    makeDialogDraggable(dialogWindow, titleBar);
    
    // Function to close the dialog
    function closeDialog() {
        // Add closing animation
        dialogWindow.classList.add('dialog-closing');
        
        // Remove event listeners
        if (dialogWindow.moveHandler && dialogWindow.upHandler) {
            document.removeEventListener('mousemove', dialogWindow.moveHandler);
            document.removeEventListener('mouseup', dialogWindow.upHandler);
        }
        
        // Remove after animation completes
        setTimeout(() => {
            document.body.removeChild(dialogOverlay);
        }, 300);
    }
    
    // Close button functionality
    closeBtn.addEventListener('click', closeDialog);
    okButton.addEventListener('click', closeDialog);
    
    // Close on overlay click
    dialogOverlay.addEventListener('click', function(e) {
        if (e.target === dialogOverlay) {
            closeDialog();
        }
    });
}

// Callback function for Cloudflare Turnstile
function turnstileCallback(token) {
    turnstileToken = token;
    captchaType = 'turnstile';
    const formStatus = document.getElementById('web3-form-status');
    if (formStatus) {
        formStatus.textContent = 'Verification completed!';
        formStatus.className = 'form-status success';
    }
}

// Callback function for hCaptcha
function hcaptchaCallback(token) {
    hcaptchaToken = token;
    captchaType = 'hcaptcha';
    const formStatus = document.getElementById('web3-form-status');
    if (formStatus) {
        formStatus.textContent = 'Verification completed!';
        formStatus.className = 'form-status success';
    }
}

// Check which captcha is loaded and switch containers if needed
function checkAndSwitchCaptcha() {
    // This function is called after a delay to ensure both scripts have had a chance to load
    const turnstileContainer = document.getElementById('turnstile-container');
    const hcaptchaContainer = document.getElementById('hcaptcha-container');
    
    if (!turnstileContainer || !hcaptchaContainer) return;
    
    if (captchaType === 'hcaptcha') {
        turnstileContainer.style.display = 'none';
        hcaptchaContainer.style.display = 'block';
    } else {
        turnstileContainer.style.display = 'block';
        hcaptchaContainer.style.display = 'none';
    }
}

// Properly expose the callback functions globally
window.turnstileCallback = turnstileCallback;
window.hcaptchaCallback = hcaptchaCallback;

// Initialize on document load
document.addEventListener('DOMContentLoaded', function() {
    initEmailForm();
    
    // After a delay, check which captcha system is available
    setTimeout(() => {
        // If the form window is open, update the captcha display
        if (document.querySelector('.email-form-window')) {
            checkAndSwitchCaptcha();
        }
    }, 5500); // Wait a bit longer than the initial captcha load timeout
});
