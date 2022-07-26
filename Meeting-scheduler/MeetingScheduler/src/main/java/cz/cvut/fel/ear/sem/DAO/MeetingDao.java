package cz.cvut.fel.ear.sem.DAO;

import cz.cvut.fel.ear.sem.model.Event;
import cz.cvut.fel.ear.sem.model.Meeting;
import cz.cvut.fel.ear.sem.model.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MeetingDao extends BaseDao<Meeting>{

    public MeetingDao() {
        super(Meeting.class);
    }


    public List<Meeting> findAllByOrganizer(User organizer){
        return em.createQuery("SELECT c FROM "+type.getSimpleName()+ " c WHERE c.organizer.id = " + organizer.getId() ,type).getResultList();

    }


    public List<Meeting> findAllByParticipant(User part){
        return em.createQuery(" SELECT c FROM Meeting c, User e  WHERE e.id= "+ part.getId() + " AND e MEMBER OF c.participants",type).getResultList();
    }
    
}
