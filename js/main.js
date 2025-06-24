// DOM Elements
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const todayEventsContainer = document.getElementById('today-events');
const upcomingEventsContainer = document.getElementById('upcoming-events');
const eventForm = document.getElementById('event-form');
const isLiveCheckbox = document.getElementById('is-live');
const streamLinkContainer = document.getElementById('stream-link-container');

// Sample Events Data (In a real application, this would come from a backend)
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

let events = [
    {
        id: 1,
        title: 'Amrit Vela Kirtan',
        description: 'Join us for early morning kirtan and simran followed by Asa Di Var',
        location: 'Guru Nanak Gurdwara Sahib',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 4, 30).toISOString(),
        isLive: true,
        streamLink: 'https://youtube.com/live/example1'
    },
    {
        id: 2,
        title: 'Evening Rehras Sahib',
        description: 'Daily evening Rehras Sahib path and kirtan program',
        location: 'Singh Sabha Gurdwara',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0).toISOString(),
        isLive: true,
        streamLink: 'https://youtube.com/live/example2'
    },
    {
        id: 3,
        title: 'Kirtan Darbar',
        description: 'Special kirtan program featuring renowned Ragi Jatha',
        location: 'Guru Arjan Dev Gurdwara',
        date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 0).toISOString(),
        isLive: false
    },
    {
        id: 4,
        title: 'Gurmat Camp',
        description: 'Youth Gurmat camp with focus on Kirtan, Gurbani, and Sikh history',
        location: 'Khalsa School Auditorium',
        date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 7, 10, 0).toISOString(),
        isLive: false
    },
    {
        id: 5,
        title: 'Akhand Path Sahib',
        description: 'Akhand Path Sahib followed by Kirtan Darbar',
        location: 'Guru Ramdas Gurdwara',
        date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 9, 8, 0).toISOString(),
        isLive: true,
        streamLink: 'https://youtube.com/live/example3'
    }
];

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


// Display Events
function displayEvents() {
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

    // Display today's events
    if (todayEventsContainer) {
        todayEventsContainer.innerHTML = todayEvents.length ? 
            todayEvents.map(event => createEventCard(event)).join('') :
            '<p class="text-center text-gray-500 col-span-full">No samagams scheduled for today</p>';
    }

    // Display upcoming events
    if (upcomingEventsContainer) {
        upcomingEventsContainer.innerHTML = upcomingEvents.length ?
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
            <p class="text-gray-600 mb-6 leading-relaxed">${event.description}</p>
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupEventForm();
    displayEvents();
    initSectionAnimations();
    setupSmoothScroll();
});

// Setup Event Form
function setupEventForm() {
    if (isLiveCheckbox && streamLinkContainer) {
        isLiveCheckbox.addEventListener('change', () => {
            streamLinkContainer.classList.toggle('hidden', !isLiveCheckbox.checked);
        });
    }

    if (eventForm) {
        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newEvent = {
                id: events.length + 1,
                title: eventForm.title.value,
                description: eventForm.description.value,
                location: eventForm.location.value,
                date: new Date(eventForm.date.value).toISOString(),
                isLive: eventForm['is-live'].checked,
                streamLink: eventForm['stream-link']?.value
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

