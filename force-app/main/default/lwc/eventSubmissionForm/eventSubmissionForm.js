import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import submitEvent from '@salesforce/apex/EventController.submitEvent';

export default class EventSubmissionForm extends LightningElement {
    @track eventData = {
        Title__c: '',
        Description__c: '',
        Location__c: '',
        Event_Date__c: null,
        Is_Live__c: false,
        Live_Stream_Link__c: ''
    };
    @track isSubmitting = false;
    @track uploadedFiles = [];

    handleInputChange(event) {
        const field = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.eventData = { ...this.eventData, [field]: value };
    }

    handleFileUpload(event) {
        const uploadedFiles = event.detail.files;
        this.uploadedFiles = uploadedFiles;
    }

    validateForm() {
        const form = this.template.querySelector('lightning-record-edit-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        return true;
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        this.isSubmitting = true;

        try {
            const eventId = await submitEvent({ event: this.eventData });
            
            // If files were uploaded, handle file upload here
            if (this.uploadedFiles.length > 0) {
                // File upload logic would go here
            }

            this.showToast('Success', 'Event submitted successfully for approval', 'success');
            this.resetForm();
        } catch (error) {
            this.showToast('Error', 'Failed to submit event: ' + error.message, 'error');
        } finally {
            this.isSubmitting = false;
        }
    }

    resetForm() {
        this.eventData = {
            Title__c: '',
            Description__c: '',
            Location__c: '',
            Event_Date__c: null,
            Is_Live__c: false,
            Live_Stream_Link__c: ''
        };
        this.uploadedFiles = [];
        
        // Reset all form elements
        this.template.querySelectorAll('lightning-input, lightning-textarea').forEach(element => {
            element.value = null;
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
