package cz.cvut.fel.ear.sem.rest;

import cz.cvut.fel.ear.sem.model.*;
import cz.cvut.fel.ear.sem.rest.utils.RestUtils;
import cz.cvut.fel.ear.sem.security.model.AuthenticationToken;
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

import java.security.Principal;

@RestController
@RequestMapping("/rest/user")
public class UserController {

    private final UserService us;
    private final EventService es;
    private final MeetingService ms;

    @Autowired
    public UserController(UserService us, EventService es, MeetingService ms) {
        this.us = us;
        this.es = es;
        this.ms = ms;
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @PutMapping(value = "/{id}/vote/{id2}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addVote(@PathVariable Integer id,@PathVariable Integer id2) {
        final User user  = us.getUser(id);
        final Event event  = es.getEvent(id2);
        us.vote(event,user);
    }

    /**
     * Registers a new user.
     *
     * @param user User data
     */
    @PreAuthorize("(anonymous || hasRole('ROLE_ADMIN'))")
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> register(@RequestBody User user) {
        us.persist(user);
        final HttpHeaders headers = RestUtils.createLocationHeaderFromCurrentUri("/current");
        return new ResponseEntity<>(headers, HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_USER')")
    @GetMapping(value = "/current", produces = MediaType.APPLICATION_JSON_VALUE)
    public User getCurrent(Principal principal) {
        final AuthenticationToken auth = (AuthenticationToken) principal;
        return auth.getPrincipal().getUser();
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping(value = "/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeUser(@PathVariable Integer id) {
        final User u = us.getUser(id);
        us.remove(u);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping(value = "/get/{id}",produces = MediaType.APPLICATION_JSON_VALUE)
    public User getUser(@PathVariable Integer id) {

            return us.getUser(id);

    }

}
