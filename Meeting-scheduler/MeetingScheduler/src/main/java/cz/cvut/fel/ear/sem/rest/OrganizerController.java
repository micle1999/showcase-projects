package cz.cvut.fel.ear.sem.rest;


import cz.cvut.fel.ear.sem.model.Meeting;
import cz.cvut.fel.ear.sem.model.User;
import cz.cvut.fel.ear.sem.service.MeetingService;
import cz.cvut.fel.ear.sem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/rest/organizer")
@PreAuthorize("permitAll()")
public class OrganizerController {

    private final UserService us;
    private final MeetingService ms;

    @Autowired
    public OrganizerController(UserService us , MeetingService ms) {
        this.us = us;
        this.ms = ms;
    }

    @GetMapping(value = "/{id}/meetings",produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Integer> getOrganizedMeetings(@PathVariable Integer id) {
        List<Integer> ids = new ArrayList<>();
        if(us.exists(id)){
            List<Meeting> meetings = us.getAllOrganizedMeetings(id); //Test
            for(Meeting m : meetings){
                ids.add(m.getId());
            }
            return ids;
        }
        return null;
    }


}
