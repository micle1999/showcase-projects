package cz.cvut.fel.ear.sem.service;

import cz.cvut.fel.ear.sem.DAO.EventDao;
import cz.cvut.fel.ear.sem.DAO.PersonalEventDao;
import cz.cvut.fel.ear.sem.DAO.UserDao;
import cz.cvut.fel.ear.sem.model.Meeting;
import cz.cvut.fel.ear.sem.model.PersonalEvent;
import cz.cvut.fel.ear.sem.model.Role;
import cz.cvut.fel.ear.sem.model.User;
import cz.cvut.fel.ear.sem.security.model.UserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
public class PersonalEventService {

    private PersonalEventDao pDao;
    private EventDao eDao;
    private UserDao uDao;


    @Autowired
    public PersonalEventService(PersonalEventDao pDao , EventDao eDao , UserDao uDao) {
        this.pDao = pDao;
        this.eDao = eDao;
        this.uDao = uDao;
    }

    @Transactional
    public void persist(PersonalEvent p) {

        Objects.requireNonNull(p);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = uDao.findByUsername(username);
        Meeting m = p.getMeeting();
        if(m.getOrganizer() == user || user.getRole()== Role.ADMIN){
            if(!eDao.findById(p.getId())){
                pDao.persist(p);
            }
        }

    }

    @Transactional(readOnly = true)
    public boolean exists(int id){
        return pDao.exists(id);
    }
}
