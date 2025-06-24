// Submit Form Specific JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const eventForm = document.getElementById('event-form');
    const onlineEventCheckbox = document.getElementById('online-event');
    const streamingLinkContainer = document.getElementById('streaming-link-container');
    const descriptionField = document.getElementById('description');
    const posterField = document.getElementById('poster');

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
                    showToast('File size must be less than 5MB', 'error');
                    posterField.value = '';
                    return;
                }
                
                // If poster is uploaded, description is no longer required
                if (descriptionField.hasAttribute('required')) {
                    descriptionField.removeAttribute('required');
                }
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
            
            // Validate description or poster requirement
            if (!validateDescriptionOrPoster()) {
                showToast('Please provide either an event description or upload a poster image', 'error');
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

            // Validate required fields
            if (!newEvent.termsAccepted) {
                showToast('Please accept the terms and conditions', 'error');
                return;
            }

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
            <h3 class="text-2xl font-bold text-amber-900 mb-2">Thank You!</h3>
            <p class="text-gray-600">Your samagam has been submitted successfully. We will review it and publish it on our website soon.</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
            <button id="close-popup" class="flex-1 bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors font-medium">
                Close
            </button>
            <a href="index.html" class="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center">
                Go to Homepage
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
