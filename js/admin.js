import { 
    auth, 
    db, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    collection, 
    getDocs, 
    query, 
    where, 
    updateDoc, 
    doc, 
    deleteDoc, 
    serverTimestamp, 
    deleteField 
} from './firebase-config.js';

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
    onAuthStateChanged(auth, (user) => {
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
            await signInWithEmailAndPassword(auth, email, password);
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
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    });

    // Refresh button
    refreshBtn.addEventListener('click', () => {
        loadAllEvents();
    });

    // Status filter
    const statusFilter = document.getElementById('status-filter');
    statusFilter.addEventListener('change', () => {
        loadAllEvents();
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
        loadAllEvents();
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
            const pendingCount = await getPendingEventsCount();
            const approvedCount = await getApprovedEventsCount();
            const totalCount = await getTotalEventsCount();

            document.getElementById('pending-count').textContent = pendingCount;
            document.getElementById('approved-count').textContent = approvedCount;
            document.getElementById('total-count').textContent = totalCount;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async function loadAllEvents() {
        try {
            showLoading(true);
            
            const statusFilter = document.getElementById('status-filter').value;
            let events = [];
            
            switch (statusFilter) {
                case 'pending':
                    events = await getPendingEvents();
                    break;
                case 'approved':
                    events = await getApprovedEvents();
                    break;
                default:
                    events = await getAllEvents();
                    break;
            }
            
            const eventsContainer = document.getElementById('events-container');
            const noEventsMessage = document.getElementById('no-events');
            
            if (events.length === 0) {
                eventsContainer.innerHTML = '';
                noEventsMessage.classList.remove('hidden');
            } else {
                noEventsMessage.classList.add('hidden');
                eventsContainer.innerHTML = events.map(event => createEventCard(event)).join('');
                
                // Add event listeners to action buttons
                addEventListeners();
            }
        } catch (error) {
            console.error('Error loading events:', error);
            showToast('Error loading events', 'error');
        } finally {
            showLoading(false);
        }
    }

    function createEventCard(event) {
        const eventDate = new Date(event.eventDate);
        const submittedDate = new Date(event.submittedAt);
        const isApproved = event.approved === true;
        
        return `
            <div class="p-6" data-event-id="${event.id}">
                <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div class="flex-1">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h3 class="text-lg font-bold text-gray-900 mb-1">${event.title}</h3>
                                <p class="text-sm text-gray-500">Submitted: ${submittedDate.toLocaleDateString()}</p>
                            </div>
                            <div class="flex gap-2">
                                ${event.isOnline ? '<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Online Event</span>' : ''}
                                <span class="text-xs px-2 py-1 rounded-full ${isApproved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}">
                                    ${isApproved ? 'Approved' : 'Pending'}
                                </span>
                            </div>
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
                        ${!isApproved ? `
                            <button class="approve-btn bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                                Approve
                            </button>
                        ` : `
                            <button class="unapprove-btn bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
                                Unapprove
                            </button>
                        `}
                        <button class="reject-btn bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                            Delete
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

        // Unapprove buttons
        document.querySelectorAll('.unapprove-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const eventCard = e.target.closest('[data-event-id]');
                const eventId = eventCard.dataset.eventId;
                
                if (confirm('Are you sure you want to unapprove this event?')) {
                    await unapproveEvent(eventId);
                }
            });
        });

        // Reject/Delete buttons
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const eventCard = e.target.closest('[data-event-id]');
                const eventId = eventCard.dataset.eventId;
                
                if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                    await rejectEvent(eventId);
                }
            });
        });
    }

    async function approveEvent(eventId) {
        try {
            showLoading(true);
            
            await approveEventInFirestore(eventId);
            
            showToast('Event approved successfully!', 'success');
            loadAllEvents();
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
            
            await rejectEventInFirestore(eventId);
            
            showToast('Event deleted successfully', 'success');
            loadAllEvents();
            loadDashboardStats();
        } catch (error) {
            console.error('Error rejecting event:', error);
            showToast('Error rejecting event', 'error');
        } finally {
            showLoading(false);
        }
    }

    // Firestore functions for real data operations using modular SDK
    async function getAllEvents() {
        try {
            console.log('Fetching all events from Firestore...');
            const eventsRef = collection(db, 'events');
            const querySnapshot = await getDocs(eventsRef);
            
            const events = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                events.push({
                    id: doc.id,
                    ...data,
                    submittedAt: data.submittedAt ? data.submittedAt.toDate() : new Date()
                });
            });
            
            console.log(`Fetched ${events.length} total events`);
            return events;
        } catch (error) {
            console.error('Error fetching all events:', error);
            return [];
        }
    }

    async function getPendingEvents() {
        try {
            console.log('Fetching pending events from Firestore...');
            const eventsRef = collection(db, 'events');
            const q = query(eventsRef, where('approved', '==', false));
            const querySnapshot = await getDocs(q);
            
            const events = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                events.push({
                    id: doc.id,
                    ...data,
                    submittedAt: data.submittedAt ? data.submittedAt.toDate() : new Date()
                });
            });
            
            console.log(`Fetched ${events.length} pending events`);
            return events;
        } catch (error) {
            console.error('Error fetching pending events:', error);
            return [];
        }
    }

    async function getApprovedEvents() {
        try {
            console.log('Fetching approved events from Firestore...');
            const eventsRef = collection(db, 'events');
            const q = query(eventsRef, where('approved', '==', true));
            const querySnapshot = await getDocs(q);
            
            const events = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                events.push({
                    id: doc.id,
                    ...data,
                    submittedAt: data.submittedAt ? data.submittedAt.toDate() : new Date()
                });
            });
            
            console.log(`Fetched ${events.length} approved events`);
            return events;
        } catch (error) {
            console.error('Error fetching approved events:', error);
            return [];
        }
    }

    async function getPendingEventsCount() {
        const events = await getPendingEvents();
        return events.length;
    }

    async function getApprovedEventsCount() {
        const events = await getApprovedEvents();
        return events.length;
    }

    async function getTotalEventsCount() {
        const events = await getAllEvents();
        return events.length;
    }

    async function approveEventInFirestore(eventId) {
        try {
            console.log(`Approving event: ${eventId}`);
            const eventRef = doc(db, 'events', eventId);
            await updateDoc(eventRef, { 
                approved: true,
                approvedAt: serverTimestamp()
            });
            console.log('Event approved successfully');
            return true;
        } catch (error) {
            console.error('Error approving event:', error);
            throw error;
        }
    }

    async function unapproveEvent(eventId) {
        try {
            showLoading(true);
            
            await unapproveEventInFirestore(eventId);
            
            showToast('Event unapproved successfully!', 'success');
            loadAllEvents();
            loadDashboardStats();
        } catch (error) {
            console.error('Error unapproving event:', error);
            showToast('Error unapproving event', 'error');
        } finally {
            showLoading(false);
        }
    }

    async function unapproveEventInFirestore(eventId) {
        try {
            console.log(`Unapproving event: ${eventId}`);
            const eventRef = doc(db, 'events', eventId);
            await updateDoc(eventRef, { 
                approved: false,
                approvedAt: deleteField()
            });
            console.log('Event unapproved successfully');
            return true;
        } catch (error) {
            console.error('Error unapproving event:', error);
            throw error;
        }
    }

    async function rejectEventInFirestore(eventId) {
        try {
            console.log(`Deleting event: ${eventId}`);
            const eventRef = doc(db, 'events', eventId);
            await deleteDoc(eventRef);
            console.log('Event deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
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
