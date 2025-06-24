// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const adminDashboard = document.getElementById('admin-dashboard');
    const userInfo = document.getElementById('user-info');
    const userEmail = document.getElementById('user-email');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const loading = document.getElementById('loading');

    // Check authentication state
    window.firebaseOnAuthStateChanged(window.firebaseAuth, (user) => {
        if (user) {
            // User is signed in
            showDashboard(user);
        } else {
            // User is signed out
            showLogin();
        }
    });

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            showLoading(true);
            await window.firebaseSignIn(window.firebaseAuth, email, password);
            hideError();
        } catch (error) {
            showError(getErrorMessage(error.code));
        } finally {
            showLoading(false);
        }
    });

    // Logout button
    logoutBtn.addEventListener('click', async () => {
        try {
            await window.firebaseSignOut(window.firebaseAuth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    });

    // Refresh button
    refreshBtn.addEventListener('click', () => {
        loadPendingEvents();
    });

    function showLogin() {
        loginContainer.classList.remove('hidden');
        adminDashboard.classList.add('hidden');
        userInfo.classList.add('hidden');
    }

    function showDashboard(user) {
        loginContainer.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        userInfo.classList.remove('hidden');
        userEmail.textContent = user.email;
        
        // Load dashboard data
        loadDashboardStats();
        loadPendingEvents();
    }

    function showLoading(show) {
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }

    function showError(message) {
        loginError.textContent = message;
        loginError.classList.remove('hidden');
    }

    function hideError() {
        loginError.classList.add('hidden');
    }

    function getErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'No user found with this email address.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/invalid-email':
                return 'Invalid email address.';
            case 'auth/too-many-requests':
                return 'Too many failed login attempts. Please try again later.';
            default:
                return 'Login failed. Please check your credentials.';
        }
    }

    async function loadDashboardStats() {
        try {
            // For demo purposes, we'll use mock data
            // In a real app, you'd fetch from Firestore
            const pendingCount = await getPendingEventsCount();
            const approvedCount = await getApprovedEventsCount();
            const totalCount = pendingCount + approvedCount;

            document.getElementById('pending-count').textContent = pendingCount;
            document.getElementById('approved-count').textContent = approvedCount;
            document.getElementById('total-count').textContent = totalCount;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async function loadPendingEvents() {
        try {
            showLoading(true);
            
            // For demo purposes, we'll use mock data
            // In a real app, you'd query Firestore for events where approved === false
            const pendingEvents = await getPendingEvents();
            
            const pendingContainer = document.getElementById('pending-events');
            const noPendingMessage = document.getElementById('no-pending');
            
            if (pendingEvents.length === 0) {
                pendingContainer.innerHTML = '';
                noPendingMessage.classList.remove('hidden');
            } else {
                noPendingMessage.classList.add('hidden');
                pendingContainer.innerHTML = pendingEvents.map(event => createEventCard(event)).join('');
                
                // Add event listeners to action buttons
                addEventListeners();
            }
        } catch (error) {
            console.error('Error loading pending events:', error);
            showToast('Error loading events', 'error');
        } finally {
            showLoading(false);
        }
    }

    function createEventCard(event) {
        const eventDate = new Date(event.eventDate);
        const submittedDate = new Date(event.submittedAt);
        
        return `
            <div class="p-6" data-event-id="${event.id}">
                <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div class="flex-1">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h3 class="text-lg font-bold text-gray-900 mb-1">${event.title}</h3>
                                <p class="text-sm text-gray-500">Submitted: ${submittedDate.toLocaleDateString()}</p>
                            </div>
                            ${event.isOnline ? '<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Online Event</span>' : ''}
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <p class="text-sm font-medium text-gray-700">Date & Time</p>
                                <p class="text-sm text-gray-600">${eventDate.toLocaleDateString()} at ${event.startTime}</p>
                                ${event.endTime ? `<p class="text-sm text-gray-600">Ends: ${event.endTime}</p>` : ''}
                            </div>
                            
                            <div>
                                <p class="text-sm font-medium text-gray-700">Location</p>
                                <p class="text-sm text-gray-600">${event.locationName}</p>
                                <p class="text-sm text-gray-500">${event.fullAddress}</p>
                            </div>
                        </div>
                        
                        ${event.description ? `
                            <div class="mb-4">
                                <p class="text-sm font-medium text-gray-700">Description</p>
                                <p class="text-sm text-gray-600">${event.description}</p>
                            </div>
                        ` : ''}
                        
                        ${event.organizer ? `
                            <div class="mb-4">
                                <p class="text-sm font-medium text-gray-700">Organizer</p>
                                <p class="text-sm text-gray-600">${event.organizer}</p>
                            </div>
                        ` : ''}
                        
                        ${event.contactName || event.contactInfo ? `
                            <div class="mb-4">
                                <p class="text-sm font-medium text-gray-700">Contact</p>
                                ${event.contactName ? `<p class="text-sm text-gray-600">${event.contactName}</p>` : ''}
                                ${event.contactInfo ? `<p class="text-sm text-gray-600">${event.contactInfo}</p>` : ''}
                            </div>
                        ` : ''}
                        
                        ${event.isOnline && event.streamingLink ? `
                            <div class="mb-4">
                                <p class="text-sm font-medium text-gray-700">Streaming Link</p>
                                <a href="${event.streamingLink}" target="_blank" class="text-sm text-blue-600 hover:text-blue-800">${event.streamingLink}</a>
                            </div>
                        ` : ''}
                        
                        ${event.additionalNotes ? `
                            <div class="mb-4">
                                <p class="text-sm font-medium text-gray-700">Additional Notes</p>
                                <p class="text-sm text-gray-600">${event.additionalNotes}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="flex flex-col sm:flex-row lg:flex-col gap-2 lg:ml-6">
                        <button class="approve-btn bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                            Approve
                        </button>
                        <button class="reject-btn bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function addEventListeners() {
        // Approve buttons
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const eventCard = e.target.closest('[data-event-id]');
                const eventId = eventCard.dataset.eventId;
                
                if (confirm('Are you sure you want to approve this event?')) {
                    await approveEvent(eventId);
                }
            });
        });

        // Reject buttons
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const eventCard = e.target.closest('[data-event-id]');
                const eventId = eventCard.dataset.eventId;
                
                if (confirm('Are you sure you want to reject and delete this event?')) {
                    await rejectEvent(eventId);
                }
            });
        });
    }

    async function approveEvent(eventId) {
        try {
            showLoading(true);
            
            // In a real app, you'd update the Firestore document
            // const eventRef = window.firebaseDoc(window.firebaseDb, 'events', eventId);
            // await window.firebaseUpdateDoc(eventRef, { approved: true });
            
            // For demo, we'll simulate the approval
            await simulateApproval(eventId);
            
            showToast('Event approved successfully!', 'success');
            loadPendingEvents();
            loadDashboardStats();
        } catch (error) {
            console.error('Error approving event:', error);
            showToast('Error approving event', 'error');
        } finally {
            showLoading(false);
        }
    }

    async function rejectEvent(eventId) {
        try {
            showLoading(true);
            
            // In a real app, you'd delete the Firestore document
            // const eventRef = window.firebaseDoc(window.firebaseDb, 'events', eventId);
            // await window.firebaseDeleteDoc(eventRef);
            
            // For demo, we'll simulate the rejection
            await simulateRejection(eventId);
            
            showToast('Event rejected and deleted', 'success');
            loadPendingEvents();
            loadDashboardStats();
        } catch (error) {
            console.error('Error rejecting event:', error);
            showToast('Error rejecting event', 'error');
        } finally {
            showLoading(false);
        }
    }

    // Mock data and functions for demo purposes
    let mockEvents = [
        {
            id: '1',
            title: 'Weekly Kirtan Darbar',
            description: 'Join us every Sunday for our weekly kirtan darbar featuring local ragis and community participation.',
            eventDate: '2024-01-15',
            startTime: '18:00',
            endTime: '20:00',
            locationName: 'Gurdwara Nanak Niwas',
            fullAddress: 'Toronto, Canada',
            isOnline: false,
            organizer: 'Singh Sabha Toronto',
            contactName: 'Jasbir Singh',
            contactInfo: 'jasbir@example.com',
            submittedAt: '2024-01-10T10:30:00Z',
            approved: false
        },
        {
            id: '2',
            title: 'Gurmat Camp for Youth',
            description: 'Educational camp focusing on Sikh history, Gurbani, and kirtan for young Sikhs.',
            eventDate: '2024-01-20',
            startTime: '09:00',
            endTime: '17:00',
            locationName: 'Khalsa School',
            fullAddress: 'Vancouver, Canada',
            isOnline: true,
            streamingLink: 'https://youtube.com/live/example',
            organizer: 'Khalsa Youth Organization',
            contactName: 'Simran Kaur',
            contactInfo: '+1-604-555-0123',
            additionalNotes: 'Lunch will be provided. Please bring notebooks.',
            submittedAt: '2024-01-08T14:20:00Z',
            approved: false
        }
    ];

    async function getPendingEvents() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockEvents.filter(event => !event.approved);
    }

    async function getPendingEventsCount() {
        const events = await getPendingEvents();
        return events.length;
    }

    async function getApprovedEventsCount() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockEvents.filter(event => event.approved).length;
    }

    async function simulateApproval(eventId) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const event = mockEvents.find(e => e.id === eventId);
        if (event) {
            event.approved = true;
        }
    }

    async function simulateRejection(eventId) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        mockEvents = mockEvents.filter(e => e.id !== eventId);
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-red-600' : 'bg-green-600';
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
});
