package cz.cvut.fel.ear.sem.service;

import cz.cvut.fel.ear.sem.model.*;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import static java.lang.String.valueOf;
import static org.junit.jupiter.api.Assertions.assertTrue;

@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional
@TestPropertySource(locations = "classpath:application-test.properties")
public class MeetingServiceTest {


    @PersistenceContext
    EntityManager em;

    @Autowired
    MeetingService mSer;

    @Autowired
    UserService uSer;


    Random rand = new Random();

    private List<User> createListOfParticipants(){
        List<User> parts = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            User p = new User();
            p.setFirstName(valueOf(rand.nextInt(10000)));
            p.setLastName(valueOf(rand.nextInt(10000)));
            parts.add(p);
            em.persist(p);
        }
        return parts;
    }

    public Meeting createSingleMeeting(){
        Meeting meeting = new Meeting();
        User o = new User();
        em.persist(o);

        meeting.setOrganizer(o);

        return meeting;
    }

    @Test
    public void everyoneInMeetingVoted_ReturnsTrue(){
        Meeting m = createSingleMeeting();
        m.setParticipants(createListOfParticipants());

        Event e = new Event();
        e.setMeeting(m);
        m.addEvent(e);
        em.persist(e);

        m.getParticipants().forEach(p -> uSer.vote(e,p));

        assertTrue(mSer.everyoneVoted(m));
    }

}
