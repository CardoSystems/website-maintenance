// ------------------------------------------------------------------------------
// web3forms.js - Handles all functionality related to the Web3Forms email form
// ------------------------------------------------------------------------------

// Configuration
const WEB3FORMS_CONFIG = {
    apiKey: FORM_SETTINGS.accessKey,
    endpoint: FORM_SETTINGS.apiEndpoint,
    soundEffects: {
        open: "https://www.myinstants.com/media/sounds/windows-xp-startup.mp3",
        send: AUDIO_SOURCES.startSound,
        success: AUDIO_SOURCES.successSound,
        error: AUDIO_SOURCES.errorSound,
        typing: "https://www.myinstants.com/media/sounds/windows-xp-pop.mp3",
        volume: AUDIO_SOURCES.volume
    }
};

// Math challenge data
let mathChallengeData = {
    num1: 0,
    num2: 0,
    operation: '+',
    correctAnswer: 0
};

// Initialize the email form functionality
function initEmailForm() {
    // Add event listener for the "Enviar Email" button
    const emailButton = document.getElementById('email-btn');
    if (emailButton) {
        emailButton.addEventListener('click', showEmailFormWindow);
    }
}

// Generate a new math challenge
function generateMathChallenge() {
    // Generate random numbers and operation
    const operations = ['+', '-', '×']; // Addition, subtraction, multiplication
    const operationIndex = Math.floor(Math.random() * operations.length);
    
    // Set difficulty based on operation
    let num1, num2;
    
    switch(operations[operationIndex]) {
        case '+': // Addition - medium difficulty
            num1 = Math.floor(Math.random() * 50) + 10; // 10-59
            num2 = Math.floor(Math.random() * 40) + 5;  // 5-44
            break;
        case '-': // Subtraction - ensure positive result
            num1 = Math.floor(Math.random() * 50) + 30; // 30-79
            num2 = Math.floor(Math.random() * 20) + 5;  // 5-24
            break;
        case '×': // Multiplication - lower numbers
            num1 = Math.floor(Math.random() * 12) + 2;  // 2-13
            num2 = Math.floor(Math.random() * 8) + 2;   // 2-9
            break;
    }
    
    // Calculate correct answer
    let correctAnswer;
    switch(operations[operationIndex]) {
        case '+':
            correctAnswer = num1 + num2;
            break;
        case '-':
            correctAnswer = num1 - num2;
            break;
        case '×':
            correctAnswer = num1 * num2;
            break;
    }
    
    // Store the challenge data
    mathChallengeData = {
        num1: num1,
        num2: num2,
        operation: operations[operationIndex],
        correctAnswer: correctAnswer
    };
    
    return mathChallengeData;
}

// Validate math challenge answer
function validateMathChallenge(userAnswer) {
    return parseInt(userAnswer, 10) === mathChallengeData.correctAnswer;
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
    titleText.textContent = 'Formulário de Contacto - Windows 7';
    
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
            <legend>As Suas Informações de Contacto</legend>
            <div class="field-row">
                <label for="name">Nome:</label>
                <input type="text" id="name" name="name" required>
            </div>
            
            <div class="field-row">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="field-row">
                <label for="company">Empresa:</label>
                <input type="text" id="company" name="company">
            </div>
        </fieldset>
        
        <fieldset>
            <legend>A Sua Mensagem</legend>
            <div class="field-row">
                <label for="subject">Assunto:</label>
                <input type="text" id="subject" name="message-subject" required>
            </div>
            
            <div class="field-row vertical">
                <label for="message">Mensagem:</label>
                <textarea id="message" name="message" rows="6" required></textarea>
            </div>
        </fieldset>
        
        <fieldset>
            <legend>Verificação</legend>
            <div class="field-row verification-row">
                <div id="math-challenge-container" class="math-challenge">
                    <div class="math-problem">
                        <span id="math-num1"></span>
                        <span id="math-operation"></span>
                        <span id="math-num2"></span>
                        <span>=</span>
                        <input type="number" id="math-answer" name="math-answer" required>
                    </div>
                    <div class="math-instructions">
                        Por favor resolva este problema matemático simples para verificar que não é um robô.
                    </div>
                </div>
            </div>
        </fieldset>
        
        <div class="form-status" id="web3-form-status"></div>
        
        <section class="field-row field-row-last">
            <button type="submit" id="send-btn">Enviar Mensagem</button>
            <button type="reset" id="reset-btn">Limpar Formulário</button>
            <button type="button" id="cancel-btn">Cancelar</button>
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
    
    // Generate and display a math challenge
    updateMathChallenge();
    
    // Add focus and blur event listeners for typing effects
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], textarea, input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('focus', () => showTypingEffect(input));
        input.addEventListener('blur', () => stopTypingEffect(input));
    });
    
    // Apply special window open animation
    dialogWindow.classList.add('window-opening');
    setTimeout(() => {
        dialogWindow.classList.remove('window-opening');
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
        // Use centralized close function for proper cleanup if available
        if (typeof closeWindow === 'function') {
            closeWindow(dialogWindow);
        } else {
            // Fallback if window manager function not available
            document.body.removeChild(dialogOverlay);
        }
    }, 300);
}

// Setup form submission with Web3Forms
function setupFormSubmission(form) {
    const formStatus = document.getElementById('web3-form-status');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate math challenge
        const mathAnswer = document.getElementById('math-answer').value;
        if (!mathAnswer || !validateMathChallenge(mathAnswer)) {
            formStatus.textContent = 'Por favor resolva o problema matemático corretamente.';
            formStatus.className = 'form-status error';
            playSound('error');
            
            // Generate a new math challenge
            updateMathChallenge();
            return;
        }
        
        // Clear previous status
        formStatus.textContent = 'A enviar mensagem...';
        formStatus.className = 'form-status sending';
        
        // Create form data
        const formData = new FormData(form);
        
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
                formStatus.textContent = 'Mensagem enviada com sucesso!';
                formStatus.className = 'form-status success';
                
                // Reset the form
                form.reset();
                
                // Generate a new math challenge
                updateMathChallenge();
                
                // Play success sound
                playSound('success');
                
                // Show success dialog after a moment
                setTimeout(() => {
                    showWindowsDialog(
                        'Mensagem Enviada', 
                        'A sua mensagem foi enviada com sucesso. A nossa equipa entrará em contacto brevemente.'
                    );
                }, 1000);
            } else {
                throw new Error(data.message || 'Form submission failed');
            }
        } catch (error) {
            // Error message
            console.error('Form error:', error);
            formStatus.innerHTML = '';
            formStatus.textContent = 'Erro ao enviar mensagem. Por favor, tente novamente.';
            formStatus.className = 'form-status error';
            
            // Play error sound
            playSound('error');
            
            // Show error dialog
            showWindowsDialog(
                'Erro', 
                'Ocorreu um erro ao enviar a sua mensagem. Por favor tente novamente mais tarde.'
            );
        }
    });
    
    // Reset form button effect
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            formStatus.textContent = '';
            formStatus.className = 'form-status';
            
            // Generate a new math challenge
            updateMathChallenge();
            
            // Add reset animation
            resetBtn.classList.add('clicked');
            setTimeout(() => {
                resetBtn.classList.remove('clicked');
            }, 200);
        });
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

// Update the math challenge in the form
function updateMathChallenge() {
    // Generate a new challenge
    const challenge = generateMathChallenge();
    
    // Update the display
    const num1Element = document.getElementById('math-num1');
    const operationElement = document.getElementById('math-operation');
    const num2Element = document.getElementById('math-num2');
    const answerInput = document.getElementById('math-answer');
    
    if (num1Element && operationElement && num2Element && answerInput) {
        num1Element.textContent = challenge.num1;
        operationElement.textContent = challenge.operation;
        num2Element.textContent = challenge.num2;
        answerInput.value = '';
        
        // Add a subtle animation to indicate the challenge changed
        const container = document.getElementById('math-challenge-container');
        if (container) {
            container.classList.add('challenge-updated');
            setTimeout(() => {
                container.classList.remove('challenge-updated');
            }, 500);
        }
    }
}

// Initialize on document load
document.addEventListener('DOMContentLoaded', initEmailForm);
