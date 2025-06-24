import { LightningElement, track, wire } from 'lwc';
import getTodayEvents from '@salesforce/apex/EventController.getTodayEvents';
import getUpcomingEvents from '@salesforce/apex/EventController.getUpcomingEvents';

export default class EventList extends LightningElement {
    @track todayEvents = [];
    @track upcomingEvents = [];
    @track error;
    @track isLoading = true;

    @wire(getTodayEvents)
    wiredTodayEvents({ error, data }) {
        this.isLoading = true;
        if (data) {
            this.todayEvents = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.todayEvents = [];
        }
        this.isLoading = false;
    }

    @wire(getUpcomingEvents)
    wiredUpcomingEvents({ error, data }) {
        this.isLoading = true;
        if (data) {
            this.upcomingEvents = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.upcomingEvents = [];
        }
        this.isLoading = false;
    }

    get hasTodayEvents() {
        return this.todayEvents.length > 0;
    }

    get hasUpcomingEvents() {
        return this.upcomingEvents.length > 0;
    }

    handleEventClick(event) {
        const eventId = event.currentTarget.dataset.id;
        // Navigate to event detail page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: eventId,
                objectApiName: 'Event__c',
                actionName: 'view'
            }
        });
    }
}
