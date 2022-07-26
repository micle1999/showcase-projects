package cz.cvut.fel.ear.sem.service;
import cz.cvut.fel.ear.sem.DAO.*;
import cz.cvut.fel.ear.sem.model.Event;
import cz.cvut.fel.ear.sem.model.Meeting;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
public class EventService {

    private MeetingDao mDao;
    private EventDao eDao;

    @Autowired
    public EventService( MeetingDao mDao, EventDao eDao) {
        this.mDao = mDao;
        this.eDao = eDao;
    }

    @Transactional
    public Event getEvent(int id) {
        return eDao.find(id);
    }


    @Transactional(readOnly = true)
    public void remove(Event event){
        eDao.remove(event);
    }


    @Transactional(readOnly = true)
    public boolean exists(int id){
        return eDao.exists(id);
    }

    @Transactional
    public void persist(Event event) {
        Objects.requireNonNull(event);
        eDao.persist(event);
    }
}
