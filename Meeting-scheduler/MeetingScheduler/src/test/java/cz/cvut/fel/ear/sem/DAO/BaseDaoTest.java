package cz.cvut.fel.ear.sem.DAO;

import cz.cvut.fel.ear.sem.Exception.EarException;
import cz.cvut.fel.ear.sem.MeetingSchedulerApplication;
import cz.cvut.fel.ear.sem.model.Meeting;
import cz.cvut.fel.ear.sem.model.Role;
import cz.cvut.fel.ear.sem.model.User;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.test.context.junit4.SpringRunner;
import java.util.Random;
import java.util.List;

import static java.lang.String.valueOf;
import static org.junit.Assert.*;

// For explanatory comments, see ProductDaoTest
@RunWith(SpringRunner.class)
@DataJpaTest
@ComponentScan(basePackageClasses = MeetingSchedulerApplication.class)
public class BaseDaoTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private MeetingDao mDao;

    Random rand = new Random();

    @Test
    public void persistSavesSpecifiedInstance() {
        final Meeting meeting = new Meeting();
        mDao.persist(meeting);
        assertNotNull(meeting.getId());

        final Meeting result = em.find(Meeting.class, meeting.getId());
        assertNotNull(result);
        assertEquals(meeting.getId(), result.getId());
    }

    public User generateOrganizer(){
        User p = new User();
        p.setFirstName(valueOf(rand.nextInt(10000)));
        p.setLastName(valueOf(rand.nextInt(10000)));
        p.setAge(rand.nextInt(10000));
        p.setEmail(valueOf(rand.nextInt(10000)));
        p.setUsername(valueOf(rand.nextInt(10000)));
        p.setPassword(valueOf(rand.nextInt(10000)));
        p.setPersonalId(rand.nextInt(10000));
        p.setPhoneNumber(valueOf(rand.nextInt(10000)));
        p.setRole(Role.USER);
        em.persist(p);

        return p;
    }


    @Test
    public void findRetrievesInstanceByIdentifier() {
        final Meeting meeting = new Meeting();
        meeting.setOrganizer(generateOrganizer());
        em.persistAndFlush(meeting);
        assertNotNull(meeting.getId());

        final Meeting result = mDao.find(meeting.getId());
        assertNotNull(result);
        assertEquals(meeting.getId(), result.getId());
    }

    @Test
    public void findAllRetrievesAllInstancesOfType() {
        final Meeting meeting1 = new Meeting();
        meeting1.setOrganizer(generateOrganizer());
        em.persistAndFlush(meeting1);
        final Meeting meeting2 = new Meeting();
        meeting2.setOrganizer(generateOrganizer());
        em.persistAndFlush(meeting2);

        final List<Meeting> result = mDao.findAll();
        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(c -> c.getId().equals(meeting1.getId())));
        assertTrue(result.stream().anyMatch(c -> c.getId().equals(meeting2.getId())));
    }

    @Test
    public void updateUpdatesExistingInstance() {
        final Meeting meeting = new Meeting();
        meeting.setOrganizer(generateOrganizer());
        em.persistAndFlush(meeting);

        final Meeting update = new Meeting();
        update.setId(meeting.getId());
        final User newOrg = new User();
        newOrg.setAge(5);
        em.persist(newOrg);
        update.setOrganizer(newOrg);
        mDao.update(update);

        final Meeting result = mDao.find(meeting.getId());
        assertNotNull(result);
        assertEquals(meeting.getId(), result.getId());
    }
    @Test
    public void removeRemovesSpecifiedInstance() {
        final Meeting meeting = new Meeting();
        meeting.setOrganizer(generateOrganizer());
        em.persistAndFlush(meeting);
        assertNotNull(em.find(Meeting.class, meeting.getId()));
        em.detach(meeting);

        mDao.remove(meeting);
        assertNull(em.find(Meeting.class, meeting.getId()));
    }

    @Test
    public void removeDoesNothingWhenInstanceDoesNotExist() {
        final Meeting meeting = new Meeting();
        meeting.setOrganizer(generateOrganizer());
        meeting.setId(123);
        assertNull(em.find(Meeting.class, meeting.getId()));

        mDao.remove(meeting);
        assertNull(em.find(Meeting.class, meeting.getId()));
    }

    @Test(expected = EarException.class)
    public void exceptionOnPersistInWrappedInPersistenceException() {
        final Meeting meeting =new Meeting();
        meeting.setOrganizer(generateOrganizer());
        em.persistAndFlush(meeting);
        em.remove(meeting);
        mDao.update(meeting);

    }

    @Test
    public void existsReturnsTrueForExistingIdentifier() {
        final Meeting meeting = new Meeting();
        meeting.setOrganizer(generateOrganizer());
        em.persistAndFlush(meeting);
        assertTrue(mDao.exists(meeting.getId()));
        assertFalse(mDao.exists(-1));
    }
}
