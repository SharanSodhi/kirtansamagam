@isTest
private class EventControllerTest {
    @TestSetup
    static void setupTestData() {
        // Create test events
        List<Event__c> events = new List<Event__c>();
        
        // Today's event
        events.add(new Event__c(
            Title__c = 'Today Test Event',
            Description__c = 'Test Description',
            Location__c = 'Test Location',
            Event_Date__c = DateTime.now(),
            Is_Live__c = true,
            Live_Stream_Link__c = 'https://test.com',
            Approved__c = true
        ));
        
        // Future event
        events.add(new Event__c(
            Title__c = 'Future Test Event',
            Description__c = 'Future Test Description',
            Location__c = 'Future Test Location',
            Event_Date__c = DateTime.now().addDays(2),
            Is_Live__c = false,
            Approved__c = true
        ));
        
        // Pending event
        events.add(new Event__c(
            Title__c = 'Pending Test Event',
            Description__c = 'Pending Test Description',
            Location__c = 'Pending Test Location',
            Event_Date__c = DateTime.now().addDays(3),
            Is_Live__c = true,
            Live_Stream_Link__c = 'https://test.com',
            Approved__c = false
        ));
        
        insert events;
    }
    
    @isTest
    static void testGetTodayEvents() {
        Test.startTest();
        List<Event__c> todayEvents = EventController.getTodayEvents();
        Test.stopTest();
        
        System.assertEquals(1, todayEvents.size(), 'Should return one event for today');
        System.assertEquals('Today Test Event', todayEvents[0].Title__c);
    }
    
    @isTest
    static void testGetUpcomingEvents() {
        Test.startTest();
        List<Event__c> upcomingEvents = EventController.getUpcomingEvents();
        Test.stopTest();
        
        System.assertEquals(1, upcomingEvents.size(), 'Should return one upcoming event');
        System.assertEquals('Future Test Event', upcomingEvents[0].Title__c);
    }
    
    @isTest
    static void testSubmitEvent() {
        Event__c newEvent = new Event__c(
            Title__c = 'New Test Event',
            Description__c = 'New Test Description',
            Location__c = 'New Test Location',
            Event_Date__c = DateTime.now().addDays(1),
            Is_Live__c = true,
            Live_Stream_Link__c = 'https://test.com'
        );
        
        Test.startTest();
        String eventId = EventController.submitEvent(newEvent);
        Test.stopTest();
        
        Event__c submittedEvent = [SELECT Id, Approved__c FROM Event__c WHERE Id = :eventId];
        System.assertNotEquals(null, submittedEvent, 'Event should be created');
        System.assertEquals(false, submittedEvent.Approved__c, 'New event should not be approved');
    }
    
    @isTest
    static void testGetEventById() {
        Event__c existingEvent = [SELECT Id FROM Event__c WHERE Title__c = 'Today Test Event' LIMIT 1];
        
        Test.startTest();
        Event__c retrievedEvent = EventController.getEventById(existingEvent.Id);
        Test.stopTest();
        
        System.assertEquals('Today Test Event', retrievedEvent.Title__c, 'Should retrieve correct event');
        System.assertEquals(true, retrievedEvent.Is_Live__c, 'Should have correct live status');
    }

    @isTest
    static void testGetPendingEvents() {
        Test.startTest();
        List<Event__c> pendingEvents = EventController.getPendingEvents();
        Test.stopTest();
        
        System.assertEquals(1, pendingEvents.size(), 'Should return one pending event');
        System.assertEquals('Pending Test Event', pendingEvents[0].Title__c);
    }
    
    @isTest
    static void testApproveEvent() {
        Event__c pendingEvent = [SELECT Id FROM Event__c WHERE Title__c = 'Pending Test Event' LIMIT 1];
        
        Test.startTest();
        EventController.approveEvent(pendingEvent.Id);
        Test.stopTest();
        
        Event__c approvedEvent = [SELECT Approved__c FROM Event__c WHERE Id = :pendingEvent.Id];
        System.assertEquals(true, approvedEvent.Approved__c, 'Event should be approved');
    }
    
    @isTest
    static void testRejectEvent() {
        Event__c pendingEvent = [SELECT Id FROM Event__c WHERE Title__c = 'Pending Test Event' LIMIT 1];
        
        Test.startTest();
        EventController.rejectEvent(pendingEvent.Id);
        Test.stopTest();
        
        List<Event__c> rejectedEvent = [SELECT Id FROM Event__c WHERE Id = :pendingEvent.Id];
        System.assertEquals(0, rejectedEvent.size(), 'Event should be deleted');
    }
}
