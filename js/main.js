// DOM Elements
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const todayEventsContainer = document.getElementById('today-events');
const upcomingEventsContainer = document.getElementById('upcoming-events');
const eventsContainer = document.getElementById('events-container');
const eventForm = document.getElementById('event-form');
const isLiveCheckbox = document.getElementById('is-live');
const streamLinkContainer = document.getElementById('stream-link-container');

// Firebase imports for event data
import { db, collection, getDocs, query, where, orderBy } from './firebase-config.js';

// Events array will be populated from Firestore
let events = [];

// Mobile Menu Toggle
function setupMobileMenu() {
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenu && !mobileMenu.contains(e.target) && mobileMenuButton && !mobileMenuButton.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
}

// Smooth scroll for navigation links
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu after clicking
                if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });
}


import { storage, getDownloadURL, ref } from './firebase-config.js';

// Fetch events from Firestore
async function fetchEventsFromFirestore() {
    try {
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('approved', '==', true), orderBy('eventDate', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const eventsPromises = querySnapshot.docs.map(async (doc) => {
            const eventData = doc.data();
            console.log('Raw event data:', eventData);
            const eventDateStr = eventData.eventDate + 'T' + eventData.startTime;
            const eventDateObj = new Date(eventDateStr);
            console.log('Constructed event date:', eventDateObj);

            let posterUrl = null;
            if (eventData.poster) {
                try {
                    posterUrl = await getDownloadURL(ref(storage, eventData.poster));
                } catch (error) {
                    console.error('Error getting poster download URL:', error);
                }
            }

            return {
                id: doc.id,
                title: eventData.title,
                description: eventData.description,
                location: eventData.locationName,
                date: eventDateObj.toISOString(),
                isLive: eventData.isOnline && eventData.streamingLink,
                streamLink: eventData.streamingLink || null,
                organizer: eventData.organizer,
                contactName: eventData.contactName,
                contactInfo: eventData.contactInfo,
                fullAddress: eventData.fullAddress,
                endTime: eventData.endTime,
                additionalNotes: eventData.additionalNotes,
                poster: posterUrl
            };
        });

        events = await Promise.all(eventsPromises);
        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

// Display Events
async function displayEvents() {
    // Fetch events from Firestore
    await fetchEventsFromFirestore();
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === now.toDateString();
    });
    
    const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate > now;
    });

    // Display today's events (for admin or specific pages)
    if (todayEventsContainer) {
        todayEventsContainer.innerHTML = todayEvents.length ? 
            todayEvents.map(event => createEventCard(event)).join('') :
            '<p class="text-center text-gray-500 col-span-full">No samagams scheduled for today</p>';
    }

    // Display upcoming events (for admin or specific pages)
    if (upcomingEventsContainer) {
        upcomingEventsContainer.innerHTML = upcomingEvents.length ?
            upcomingEvents.map(event => createEventCard(event)).join('') :
            '<p class="text-center text-gray-500 col-span-full">No upcoming samagams scheduled</p>';
    }

    // Display all upcoming events for homepage
    if (eventsContainer) {
        eventsContainer.innerHTML = upcomingEvents.length ?
            upcomingEvents.map(event => createEventCard(event)).join('') :
            '<p class="text-center text-gray-500 col-span-full">No upcoming samagams scheduled</p>';
    }
}

// Create Event Card HTML
function createEventCard(event) {
    const eventDate = new Date(event.date);
    return `
        <div class="event-card bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-amber-100">
            <div class="flex justify-between items-start mb-6">
                <h3 class="text-xl font-bold text-amber-900">${event.title}</h3>
                ${event.isLive ? '<span class="live-badge bg-amber-600 text-white text-xs px-3 py-1 rounded-full font-medium">LIVE</span>' : ''}
            </div>
            ${event.poster ? `
                <div class="mb-4 cursor-pointer">
                    <img src="${event.poster}" alt="Event Poster" class="max-w-full h-32 object-cover rounded-lg shadow-md" data-fullsrc="${event.poster}" />
                </div>
            ` : ''}
            <p class="text-gray-600 mb-6 leading-relaxed">${event.description || 'Event details will be updated soon.'}</p>
            <div class="text-sm text-gray-500 space-y-3">
                <p class="flex items-center">
                    <svg class="w-5 h-5 text-amber-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span class="text-amber-900">${event.location}</span>
                </p>
                <p class="flex items-center">
                    <svg class="w-5 h-5 text-amber-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-amber-900">${formatDate(eventDate)}</span>
                </p>
                ${event.organizer ? `
                    <p class="flex items-center">
                        <svg class="w-5 h-5 text-amber-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <span class="text-amber-900">Organized by ${event.organizer}</span>
                    </p>
                ` : ''}
            </div>
            ${event.isLive && event.streamLink ? `
                <a href="${event.streamLink}" target="_blank" 
                   class="mt-6 inline-block bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium w-full text-center">
                    Watch Live Stream
                </a>
            ` : ''}
        </div>
    `;
}

// Format Date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    }).format(date);
}

// Show Toast Message
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-amber-600 text-white px-6 py-3 rounded-lg shadow-lg transform translate-y-full opacity-0 transition-all duration-300';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
        toast.classList.remove('translate-y-full', 'opacity-0');
    }, 100);

    // Hide and remove toast
    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function setupImageModal() {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const closeBtn = document.getElementById('modal-close-btn');

    if (!modal || !modalImage || !closeBtn) {
        return;
    }

    // Close modal function
    function closeModal() {
        modal.classList.add('hidden');
        modalImage.src = '';
    }

    // Close modal on close button click
    closeBtn.addEventListener('click', closeModal);

    // Close modal on clicking outside the image
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Delegate click event for event poster thumbnails
    document.body.addEventListener('click', (e) => {
        if (e.target.matches('.event-card img[data-fullsrc]')) {
            const fullSrc = e.target.getAttribute('data-fullsrc');
            modalImage.src = fullSrc;
            modal.classList.remove('hidden');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupEventForm();
    displayEvents();
    initSectionAnimations();
    setupSmoothScroll();
    setupImageModal();
});

// Setup Event Form
function setupEventForm() {
    if (isLiveCheckbox && streamLinkContainer) {
        isLiveCheckbox.addEventListener('change', () => {
            streamLinkContainer.classList.toggle('hidden', !isLiveCheckbox.checked);
        });
    }

    if (eventForm) {
        // Check if required form elements exist before adding submit listener
        const titleInput = eventForm.querySelector('input[name="title"]');
        const descriptionInput = eventForm.querySelector('textarea[name="description"]');
        const locationInput = eventForm.querySelector('input[name="location"]');
        const dateInput = eventForm.querySelector('input[name="date"]');
        const isLiveInput = eventForm.querySelector('input[name="is-live"]');
        const streamLinkInput = eventForm.querySelector('input[name="stream-link"]');

        if (titleInput && descriptionInput && locationInput && dateInput && isLiveInput) {
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const newEvent = {
                    id: events.length + 1,
                    title: titleInput.value,
                    description: descriptionInput.value,
                    location: locationInput.value,
                    date: new Date(dateInput.value).toISOString(),
                    isLive: isLiveInput.checked,
                    streamLink: streamLinkInput ? streamLinkInput.value : null
                };

                // Add new event to the array (in a real app, this would be sent to a backend)
                events.push(newEvent);
                
                // Show success message
                showToast('Samagam submitted successfully!');
                
                // Reset form
                eventForm.reset();
                if (streamLinkContainer) {
                    streamLinkContainer.classList.add('hidden');
                }

                // Redirect to homepage after 2 seconds
                setTimeout(() => {
                    window.location.href = 'index.html#events';
                }, 2000);
            });
        }
    }
}

// Section Animations
function initSectionAnimations() {
    const sections = document.querySelectorAll('section');
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, options);

    sections.forEach(section => {
        section.classList.remove('visible'); // Reset visibility
        observer.observe(section);
    });
}

