package cz.cvut.fel.ear.sem.service;

import cz.cvut.fel.ear.sem.DAO.EventDao;
import cz.cvut.fel.ear.sem.DAO.MeetingDao;
import cz.cvut.fel.ear.sem.model.Event;
import cz.cvut.fel.ear.sem.model.Meeting;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
public class MeetingService {


    private MeetingDao mDao;
    private EventDao eDao;

    @Autowired
    public MeetingService( MeetingDao mDao, EventDao eDao) {
        this.mDao = mDao;
        this.eDao = eDao;
    }

    @Transactional
    public Meeting getMeeting(int id) {
        return mDao.find(id);
    }

    @Transactional(readOnly = true)
    public boolean exists(int id){
        return mDao.exists(id);
    }

    @Transactional
    public void persist(Meeting meeting) {
        Objects.requireNonNull(meeting);
        mDao.persist(meeting);
    }


    public boolean everyoneVoted(Meeting m){
        int numOfParticipants = m.getParticipants().size();
        int numOfVoters = 0;

        for(Event e :m.getEvents()) numOfVoters += e.getVoters().size();

        return numOfParticipants == numOfVoters;
    }

}
