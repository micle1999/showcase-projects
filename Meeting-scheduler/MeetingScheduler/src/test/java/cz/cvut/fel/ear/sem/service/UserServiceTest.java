package cz.cvut.fel.ear.sem.service;

import cz.cvut.fel.ear.sem.model.*;
import org.junit.Test;
import org.junit.jupiter.api.Assertions;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.parameters.P;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import static java.lang.String.valueOf;
import static org.junit.jupiter.api.Assertions.assertEquals;

@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional
@TestPropertySource(locations = "classpath:application-test.properties")
public class UserServiceTest {

    @PersistenceContext
    EntityManager em;

    @Autowired
    private UserService userSer;

    public Meeting createSingleMeeting(){
        Meeting meeting = new Meeting();
        User o = new User();
        em.persist(o);
        meeting.setOrganizer(o);
        em.persist(meeting);
        return meeting;
    }

    @Test
    public void voteWhenParticipantInMeeting_VoteRegistered(){
        User user = new User();
        em.persist(user);
        Meeting meeting = createSingleMeeting();

        meeting.addParticipant(user);
        Event e = new Event();

        e.setMeeting(meeting);
        em.persist(e);
        meeting.addEvent(e);
        userSer.vote(e,user);
        Assertions.assertTrue(e.getVoters().contains(user));
    }
    @Test
    public void voteWhenParticipantNotInMeeting_VoteNotRegistered(){
        User user = new User();
        em.persist(user);
        Meeting meeting = createSingleMeeting();

        Event e = new Event();
        e.setMeeting(meeting);
        em.persist(e);
        meeting.addEvent(e);


        userSer.vote(e,user);

        Assertions.assertFalse(e.getVoters().contains(user));
    }

    @Test
    public void participantVotedTwice_VoteRegisteredOnlyOnce(){
        User user = new User();
        em.persist(user);
        Meeting meeting = createSingleMeeting();
        meeting.addParticipant(user);

        Event e = new Event();
        e.setMeeting(meeting);
        em.persist(e);
        meeting.addEvent(e);

        userSer.vote(e,user);
        userSer.vote(e,user);

        assertEquals(1,e.getVoters().size());
    }

    @Test
    public void participantVotedTwiceForDifferentEvents_VoteRegisteredOnlyOnce(){
        User user = new User();
        em.persist(user);
        Meeting meeting = createSingleMeeting();
        meeting.addParticipant(user);

        Event e = new Event();
        Event e2 = new Event();

        e.setMeeting(meeting);
        e2.setMeeting(meeting);
        em.persist(e);
        em.persist(e2);
        meeting.addEvent(e);
        meeting.addEvent(e2);

        userSer.vote(e,user);
        userSer.vote(e2,user);

        assertEquals(1,e.getVoters().size());
        assertEquals(0,e2.getVoters().size());
    }

}
