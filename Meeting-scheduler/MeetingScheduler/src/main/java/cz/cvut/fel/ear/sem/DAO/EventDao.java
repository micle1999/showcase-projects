package cz.cvut.fel.ear.sem.DAO;

import cz.cvut.fel.ear.sem.model.Event;
import org.springframework.stereotype.Repository;

@Repository
public class EventDao extends BaseDao<Event> {

    public EventDao() {
        super(Event.class);
    }

    public boolean findById(int id) {
        if(em.find(Event.class,id) == null){
            return false;
        }
        return true;
    }
}
