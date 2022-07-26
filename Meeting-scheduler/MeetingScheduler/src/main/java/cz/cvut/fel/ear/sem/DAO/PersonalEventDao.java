package cz.cvut.fel.ear.sem.DAO;

import cz.cvut.fel.ear.sem.model.PersonalEvent;
import org.springframework.stereotype.Repository;

@Repository
public class PersonalEventDao extends BaseDao<PersonalEvent> {
    public PersonalEventDao() {
        super(PersonalEvent.class);
    }
}
