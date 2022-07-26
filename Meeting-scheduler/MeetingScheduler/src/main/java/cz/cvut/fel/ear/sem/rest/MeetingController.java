package cz.cvut.fel.ear.sem.rest;

import cz.cvut.fel.ear.sem.model.*;
import cz.cvut.fel.ear.sem.rest.utils.RestUtils;
import cz.cvut.fel.ear.sem.service.EventService;
import cz.cvut.fel.ear.sem.service.MeetingService;
import cz.cvut.fel.ear.sem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rest/meeting")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_USER')")
public class MeetingController {

    private final MeetingService ms;
    private final UserService us;
    private final EventService es;

    @Autowired
    public MeetingController(EventService es , MeetingService meetingService, UserService us) {
        this.ms = meetingService;
        this.us = us;
        this.es = es;
    }

    @GetMapping(value = "/{id}",produces = MediaType.APPLICATION_JSON_VALUE)
    public Meeting getMeeting(@PathVariable Integer id) {
        if(ms.exists(id)){
            return ms.getMeeting(id);
        }
        return null;
    }

    @PostMapping(value = "/organizer/{id}" , consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> createMeeting(@PathVariable Integer id , @RequestBody Meeting meeting) {
        final Meeting meet = meeting;
        final User organizer = us.getUser(id);
        meet.setOrganizer(organizer);
        ms.persist(meet);
        final HttpHeaders headers = RestUtils.createLocationHeaderFromCurrentUri("/{id}", meet.getId());
        return new ResponseEntity<>(headers, HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}/participants/{id2}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeParticipantFromMeeting(@PathVariable Integer id ,  @PathVariable Integer id2) {
        final Meeting meeting = ms.getMeeting(id);
        us.removeParticipantFromMeeting(meeting , id2);
    }


    @PostMapping(value = "/{id}/participants/add/{id2}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> addParticipant(@PathVariable Integer id , @PathVariable Integer id2 ) {
        final Meeting meeting = ms.getMeeting(id);
        us.addParticipantToMeeting(meeting, id2);
        final HttpHeaders headers = RestUtils.createLocationHeaderFromCurrentUri("/{id}", meeting.getId());
        return new ResponseEntity<>(headers, HttpStatus.CREATED);
    }

    @PostMapping(value = "/{id}/events/personal", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> addPersonalEventToMeeting(@RequestBody PersonalEvent event, @PathVariable Integer id) {
        final Meeting meeting = ms.getMeeting(id);
        event.setMeeting(meeting);
        us.addPersonalEventToMeeting(meeting,event);
        final HttpHeaders headers = RestUtils.createLocationHeaderFromCurrentUri("/{id}", meeting.getId());
        return new ResponseEntity<>(headers, HttpStatus.CREATED);
    }

    @PostMapping(value = "/{id}/events/online", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> addOnlineEventToMeeting(@RequestBody OnlineEvent event, @PathVariable Integer id) {
        final Meeting meeting = ms.getMeeting(id);
        event.setMeeting(meeting);
        us.addOnlineEventToMeeting(meeting,event);
        final HttpHeaders headers = RestUtils.createLocationHeaderFromCurrentUri("/{id}", meeting.getId());
        return new ResponseEntity<>(headers, HttpStatus.CREATED);
    }

    @DeleteMapping(value = "/{id}/events/{id2}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeEventFromMeeting(@PathVariable Integer id ,  @PathVariable Integer id2) {
        final Meeting meeting = ms.getMeeting(id);
        us.removeEventFromMeeting(meeting,id2);
    }

    @DeleteMapping(value = "/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMeeting(@PathVariable Integer id) {
        us.removeMeeting(id);
    }


    @PutMapping(value = "/{id}/events/{id2}/choose", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void chooseEventOfMeetingAutomatically(@PathVariable Integer id , @PathVariable Integer id2) {
        final Meeting meeting = ms.getMeeting(id);
        Event event = es.getEvent(id2);
        us.chooseEventManually(meeting,event);
    }

}
