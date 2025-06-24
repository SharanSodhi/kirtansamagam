public with sharing class EventController {
    @AuraEnabled(cacheable=true)
    public static List<Event__c> getTodayEvents() {
        Date today = Date.today();
        return [
            SELECT Id, Title__c, Description__c, Location__c, Event_Date__c, 
                   Is_Live__c, Live_Stream_Link__c
            FROM Event__c 
            WHERE Approved__c = true 
            AND Date.valueOf(Event_Date__c) = :today
            ORDER BY Event_Date__c ASC
        ];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Event__c> getUpcomingEvents() {
        Date today = Date.today();
        Date nextWeek = today.addDays(7);
        return [
            SELECT Id, Title__c, Description__c, Location__c, Event_Date__c, 
                   Is_Live__c, Live_Stream_Link__c
            FROM Event__c 
            WHERE Approved__c = true 
            AND Date.valueOf(Event_Date__c) > :today
            AND Date.valueOf(Event_Date__c) <= :nextWeek
            ORDER BY Event_Date__c ASC
        ];
    }
    
    @AuraEnabled
    public static String submitEvent(Event__c event) {
        try {
            event.Approved__c = false; // New events require approval
            insert event;
            return event.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error submitting event: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static Event__c getEventById(String eventId) {
        try {
            return [
                SELECT Id, Title__c, Description__c, Location__c, Event_Date__c, 
                       Is_Live__c, Live_Stream_Link__c, Approved__c
                FROM Event__c 
                WHERE Id = :eventId
                LIMIT 1
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving event: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Event__c> getPendingEvents() {
        return [
            SELECT Id, Title__c, Description__c, Location__c, Event_Date__c, 
                   Is_Live__c, Live_Stream_Link__c
            FROM Event__c 
            WHERE Approved__c = false
            ORDER BY Event_Date__c ASC
        ];
    }

    @AuraEnabled
    public static void approveEvent(String eventId) {
        try {
            Event__c event = [SELECT Id FROM Event__c WHERE Id = :eventId LIMIT 1];
            event.Approved__c = true;
            update event;
        } catch (Exception e) {
            throw new AuraHandledException('Error approving event: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void rejectEvent(String eventId) {
        try {
            Event__c event = [SELECT Id FROM Event__c WHERE Id = :eventId LIMIT 1];
            delete event;
        } catch (Exception e) {
            throw new AuraHandledException('Error rejecting event: ' + e.getMessage());
        }
    }
}
