package cz.cvut.fel.ear.sem.service;

import cz.cvut.fel.ear.sem.model.Event;
import cz.cvut.fel.ear.sem.model.Meeting;
import cz.cvut.fel.ear.sem.model.User;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
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
import static org.junit.jupiter.api.Assertions.*;

@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional
@TestPropertySource(locations = "classpath:application-test.properties")
public class OrganizerServiceTest {

    @PersistenceContext
    EntityManager em;


    @Autowired
    private UserService uSer;

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

    private User createSingleParticipant(){
        User p = new User();
        p.setFirstName("123");
        p.setLastName("456");
        em.persist(p);
        return p;
    }
    
    @Test
    public void createMeeting_MeetingContainsAllParticipants(){
        User org = new User();
        em.persist(org);
        List<User> parts = createListOfParticipants();
        Meeting m = uSer.createMeeting(org, LocalDateTime.now(),parts);

        Meeting m2 = em.find(Meeting.class,m.getId());

        assertEquals(10,m2.getParticipants().size());

    }

    @Test
    public void addParticipantToEmptyMeeting_AddsSuccesfully(){
        Meeting m = new Meeting();
        em.persist(m);
        User part = createSingleParticipant();

        uSer.addParticipantToMeeting(m,part.getId());
        assertEquals("123",m.getParticipants().get(0).getFirstName());
        assertEquals("456",m.getParticipants().get(0).getLastName());
    }

    @Test
    public void addParticipants_AddsAllParticipantsSuccesfully(){
        Meeting m = new Meeting();
        em.persist(m);

        uSer.addParticipantsToMeeting(m,createListOfParticipants());
        assertEquals(10,m.getParticipants().size());
    }

    @Test
    public void removeParticipantFromMeeting_RemovesSuccesfully(){
        Meeting m = new Meeting();
        em.persist(m);
        User part = createSingleParticipant();

        uSer.addParticipantToMeeting(m,part.getId());

        uSer.removeParticipantFromMeeting(m,part.getId());
        assertEquals(0,m.getParticipants().size());
    }

    @Test
    public void removeParticipantNotInMeeting_DoesNothing(){
        Meeting m = new Meeting();
        em.persist(m);
        User part = createSingleParticipant();

        uSer.addParticipantToMeeting(m,part.getId());
        uSer.removeParticipantFromMeeting(m,part.getId()+1);

        assertEquals(1,m.getParticipants().size());
        assertEquals("123",m.getParticipants().get(0).getFirstName());
        assertEquals("456",m.getParticipants().get(0).getLastName());

    }

    @Test
    public void chooseEventManuallyWhenEventNotInMeeting_EventNotChosen(){
        Meeting m = new Meeting();
        Event e = new Event();
        em.persist(e);
        em.persist(m);

        uSer.chooseEventManually(m,e);

        assertFalse(e.isApproved());


        e.setMeeting(m);
        m.addEvent(e);
    }

    @Test
    public void chooseEventManuallyWhenAnotherEventIsAlreadyChosen_EventNotChosen(){
        Meeting m = new Meeting();
        Event e = new Event();
        e.setApproved(true);
        Event e2 = new Event();
        e.setMeeting(m);
        m.addEvent(e);
        e2.setMeeting(m);
        m.addEvent(e2);

        em.persist(e);
        em.persist(e2);
        em.persist(m);

        uSer.chooseEventManually(m,e2);

        assertFalse(e2.isApproved());


    }

    @Test
    public void chooseEventAutomatically_EventWithMostVotersIsChosen(){
        Meeting m = new Meeting();
        m.setParticipants(createListOfParticipants());
        Event e = new Event();
        e.setApproved(true);
        Event e2 = new Event();
        e.setMeeting(m);
        m.addEvent(e);
        e2.setMeeting(m);
        m.addEvent(e2);

        em.persist(e);
        em.persist(e2);
        em.persist(m);

        m.getParticipants().forEach(p -> uSer.vote(e,p));

        uSer.chooseEventAutomatically(m);

        assertEquals(10,e.getVoters().size());
        assertTrue(e.isApproved());
        assertFalse(e2.isApproved());


    }




}
