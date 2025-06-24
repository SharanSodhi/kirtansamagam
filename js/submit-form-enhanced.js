// Submit Form Specific JavaScript with Enhanced Error Handling

// Show field error
function showFieldError(field, message) {
    // Add red border
    field.classList.add('border-red-500', 'border-2');
    field.classList.remove('border-amber-200');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-red-600 text-sm mt-1';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// Clear all errors
function clearAllErrors() {
    // Remove red borders
    document.querySelectorAll('.border-red-500').forEach(field => {
        field.classList.remove('border-red-500', 'border-2');
        field.classList.add('border-amber-200');
    });
    
    // Remove error messages
    document.querySelectorAll('.error-message').forEach(error => {
        error.remove();
    });
}

// Clear single field error
function clearFieldError(field) {
    field.classList.remove('border-red-500', 'border-2');
    field.classList.add('border-amber-200');
    
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const eventForm = document.getElementById('event-form');
    const onlineEventCheckbox = document.getElementById('online-event');
    const streamingLinkContainer = document.getElementById('streaming-link-container');
    const descriptionField = document.getElementById('description');
    const posterField = document.getElementById('poster');

    // Add real-time error clearing
    const allFields = document.querySelectorAll('input, textarea, select');
    allFields.forEach(field => {
        field.addEventListener('input', () => clearFieldError(field));
        field.addEventListener('change', () => clearFieldError(field));
    });

    // Setup online event checkbox
    if (onlineEventCheckbox && streamingLinkContainer) {
        onlineEventCheckbox.addEventListener('change', () => {
            streamingLinkContainer.classList.toggle('hidden', !onlineEventCheckbox.checked);
            const streamingLinkField = document.getElementById('streaming-link');
            if (onlineEventCheckbox.checked) {
                streamingLinkField.setAttribute('required', 'required');
            } else {
                streamingLinkField.removeAttribute('required');
                streamingLinkField.value = '';
                clearFieldError(streamingLinkField);
            }
        });
    }

    // Custom validation for description/poster requirement
    function validateDescriptionOrPoster() {
        const hasDescription = descriptionField.value.trim().length > 0;
        const hasPoster = posterField.files.length > 0;
        
        if (!hasDescription && !hasPoster) {
            return false;
        }
        return true;
    }

    // File size validation
    if (posterField) {
        posterField.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    showFieldError(posterField, 'File size must be less than 5MB (ਫਾਈਲ ਦਾ ਸਾਈਜ਼ 5MB ਤੋਂ ਘੱਟ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ)');
                    posterField.value = '';
                    return;
                }
                
                // If poster is uploaded, description is no longer required
                if (descriptionField.hasAttribute('required')) {
                    descriptionField.removeAttribute('required');
                }
                clearFieldError(posterField);
                clearFieldError(descriptionField);
            } else {
                // If no poster, description becomes required again
                if (!descriptionField.value.trim()) {
                    descriptionField.setAttribute('required', 'required');
                }
            }
        });
    }

    // Description field validation
    if (descriptionField) {
        descriptionField.addEventListener('input', () => {
            if (descriptionField.value.trim().length > 0) {
                // If description exists, poster is no longer required
                if (posterField) {
                    posterField.removeAttribute('required');
                }
                clearFieldError(descriptionField);
                clearFieldError(posterField);
            } else if (!posterField.files.length) {
                // If no description and no poster, make poster required
                if (posterField) {
                    posterField.setAttribute('required', 'required');
                }
            }
        });
    }

    // Form submission
    if (eventForm) {
        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Clear previous error states
            clearAllErrors();
            
            let hasErrors = false;
            
            // Validate required fields
            const requiredFields = [
                { field: document.getElementById('title'), message: 'Event title is mandatory (ਸਮਾਗਮ ਦਾ ਨਾਮ ਲਾਜ਼ਮੀ ਹੈ)' },
                { field: document.getElementById('event-date'), message: 'Event date is mandatory (ਸਮਾਗਮ ਦੀ ਤਾਰੀਖ ਲਾਜ਼ਮੀ ਹੈ)' },
                { field: document.getElementById('start-time'), message: 'Start time is mandatory (ਸ਼ੁਰੂ ਹੋਣ ਦਾ ਸਮਾਂ ਲਾਜ਼ਮੀ ਹੈ)' },
                { field: document.getElementById('location-name'), message: 'Location name is mandatory (ਸਥਾਨ ਦਾ ਨਾਮ ਲਾਜ਼ਮੀ ਹੈ)' },
                { field: document.getElementById('full-address'), message: 'Full address is mandatory (ਪੂਰਾ ਪਤਾ ਲਾਜ਼ਮੀ ਹੈ)' },
                { field: document.getElementById('terms-consent'), message: 'You must accept the terms and conditions (ਤੁਸੀਂ ਨਿਯਮ ਅਤੇ ਸ਼ਰਤਾਂ ਨੂੰ ਸਵੀਕਾਰ ਕਰਨਾ ਲਾਜ਼ਮੀ ਹੈ)' }
            ];
            
            // Check each required field
            requiredFields.forEach(({ field, message }) => {
                if (!field) return;
                
                if (field.type === 'checkbox') {
                    if (!field.checked) {
                        showFieldError(field, message);
                        hasErrors = true;
                    }
                } else {
                    if (!field.value.trim()) {
                        showFieldError(field, message);
                        hasErrors = true;
                    }
                }
            });
            
            // Validate description or poster requirement
            if (!validateDescriptionOrPoster()) {
                const descField = document.getElementById('description');
                const posterField = document.getElementById('poster');
                const message = 'Either description or image is mandatory (ਵੇਰਵਾ ਜਾਂ ਤਸਵੀਰ ਲਾਜ਼ਮੀ ਹੈ)';
                
                if (!descField.value.trim()) {
                    showFieldError(descField, message);
                }
                if (!posterField.files.length) {
                    showFieldError(posterField, message);
                }
                hasErrors = true;
            }
            
            // Check online event streaming link
            const onlineEventCheckbox = document.getElementById('online-event');
            const streamingLinkField = document.getElementById('streaming-link');
            if (onlineEventCheckbox && onlineEventCheckbox.checked && streamingLinkField && !streamingLinkField.value.trim()) {
                showFieldError(streamingLinkField, 'Streaming link is mandatory for online events (ਆਨਲਾਈਨ ਸਮਾਗਮ ਲਈ ਸਟ੍ਰੀਮਿੰਗ ਲਿੰਕ ਲਾਜ਼ਮੀ ਹੈ)');
                hasErrors = true;
            }
            
            if (hasErrors) {
                showToast('Please fill all mandatory fields (ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੇ ਲਾਜ਼ਮੀ ਖੇਤਰ ਭਰੋ)', 'error');
                // Scroll to first error
                const firstError = document.querySelector('.border-red-500');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            // Create form data object
            const formData = new FormData(eventForm);
            
            // Create event object
            const newEvent = {
                id: Date.now(), // Simple ID generation
                title: formData.get('title'),
                description: formData.get('description'),
                poster: formData.get('poster')?.name || null,
                eventDate: formData.get('event-date'),
                startTime: formData.get('start-time'),
                endTime: formData.get('end-time'),
                locationName: formData.get('location-name'),
                fullAddress: formData.get('full-address'),
                isOnline: formData.get('online-event') === 'on',
                streamingLink: formData.get('streaming-link'),
                contactName: formData.get('contact-name'),
                contactInfo: formData.get('contact-info'),
                organizer: formData.get('organizer'),
                additionalNotes: formData.get('additional-notes'),
                termsAccepted: formData.get('terms-consent') === 'on',
                submittedAt: new Date().toISOString()
            };

            // Show success popup
            showSuccessPopup();
            
            // Reset form
            eventForm.reset();
            if (streamingLinkContainer) {
                streamingLinkContainer.classList.add('hidden');
            }
            
            // Reset field requirements
            descriptionField.setAttribute('required', 'required');
            if (posterField) {
                posterField.removeAttribute('required');
            }

            // In a real application, you would send this data to a backend
            console.log('Event submitted:', newEvent);
        });
    }
});

// Show success popup
function showSuccessPopup() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    
    // Create popup
    const popup = document.createElement('div');
    popup.className = 'bg-white rounded-xl p-8 max-w-md w-full text-center shadow-2xl transform scale-95 opacity-0 transition-all duration-300';
    
    popup.innerHTML = `
        <div class="mb-6">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <h3 class="text-2xl font-bold text-amber-900 mb-2">Thank You! (ਧੰਨਵਾਦ!)</h3>
            <p class="text-gray-600">Your samagam has been submitted successfully. We will review it and publish it on our website soon.<br><br>ਤੁਹਾਡਾ ਸਮਾਗਮ ਸਫਲਤਾਪੂਰਵਕ ਭੇਜਿਆ ਗਿਆ ਹੈ। ਅਸੀਂ ਇਸਦੀ ਸਮੀਖਿਆ ਕਰਾਂਗੇ ਅਤੇ ਜਲਦੀ ਹੀ ਇਸਨੂੰ ਸਾਡੀ ਵੈੱਬਸਾਈਟ ਤੇ ਪ੍ਰਕਾਸ਼ਿਤ ਕਰਾਂਗੇ।</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
            <button id="close-popup" class="flex-1 bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors font-medium">
                Close (ਬੰਦ ਕਰੋ)
            </button>
            <a href="index.html" class="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center">
                Go to Homepage (ਮੁੱਖ ਪੰਨਾ)
            </a>
        </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Show popup with animation
    setTimeout(() => {
        popup.classList.remove('scale-95', 'opacity-0');
        popup.classList.add('scale-100', 'opacity-100');
    }, 100);
    
    // Close popup functionality
    const closeButton = popup.querySelector('#close-popup');
    closeButton.addEventListener('click', () => {
        popup.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            popup.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        }
    });
}

// Show toast message
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-600' : 'bg-amber-600';
    toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform translate-y-full opacity-0 transition-all duration-300 z-50`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
        toast.classList.remove('translate-y-full', 'opacity-0');
    }, 100);

    // Hide and remove toast
    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
}
