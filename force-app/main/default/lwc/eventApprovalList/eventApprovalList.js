import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getPendingEvents from '@salesforce/apex/EventController.getPendingEvents';
import approveEvent from '@salesforce/apex/EventController.approveEvent';
import rejectEvent from '@salesforce/apex/EventController.rejectEvent';

const COLUMNS = [
    { label: 'Title', fieldName: 'Title__c', type: 'text' },
    { label: 'Location', fieldName: 'Location__c', type: 'text' },
    { 
        label: 'Event Date',
        fieldName: 'Event_Date__c',
        type: 'date',
        typeAttributes: {
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    },
    { label: 'Live Stream', fieldName: 'Is_Live__c', type: 'boolean' },
    {
        type: 'action',
        typeAttributes: {
            rowActions: [
                { label: 'Approve', name: 'approve' },
                { label: 'Reject', name: 'reject' },
                { label: 'View Details', name: 'view' }
            ]
        }
    }
];

export default class EventApprovalList extends LightningElement {
    @track columns = COLUMNS;
    @track data = [];
    @track error;
    @track isLoading = true;
    wiredEventsResult;

    @wire(getPendingEvents)
    wiredEvents(result) {
        this.wiredEventsResult = result;
        this.isLoading = true;
        if (result.data) {
            this.data = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.data = [];
        }
        this.isLoading = false;
    }

    async handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        switch (action.name) {
            case 'approve':
                await this.handleApprove(row);
                break;
            case 'reject':
                await this.handleReject(row);
                break;
            case 'view':
                this.handleView(row);
                break;
            default:
                break;
        }
    }

    async handleApprove(row) {
        try {
            await approveEvent({ eventId: row.Id });
            this.showToast('Success', 'Event approved successfully', 'success');
            await refreshApex(this.wiredEventsResult);
        } catch (error) {
            this.showToast('Error', 'Failed to approve event: ' + error.message, 'error');
        }
    }

    async handleReject(row) {
        try {
            await rejectEvent({ eventId: row.Id });
            this.showToast('Success', 'Event rejected', 'success');
            await refreshApex(this.wiredEventsResult);
        } catch (error) {
            this.showToast('Error', 'Failed to reject event: ' + error.message, 'error');
        }
    }

    handleView(row) {
        // Navigate to record page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: row.Id,
                objectApiName: 'Event__c',
                actionName: 'view'
            }
        });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}
