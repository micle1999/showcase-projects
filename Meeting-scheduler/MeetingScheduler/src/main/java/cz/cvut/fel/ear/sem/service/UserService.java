package cz.cvut.fel.ear.sem.service;

import cz.cvut.fel.ear.sem.DAO.EventDao;
import cz.cvut.fel.ear.sem.DAO.MeetingDao;
import cz.cvut.fel.ear.sem.DAO.UserDao;
import cz.cvut.fel.ear.sem.model.*;
import cz.cvut.fel.ear.sem.security.model.UserDetails;
import org.eclipse.persistence.annotations.ReadOnly;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class UserService {


    private final PasswordEncoder passwordEncoder;

    private EventDao eDao;
    private UserDao uDao;
    private MeetingDao mDao;


    @Autowired
    public UserService( UserDao uDao, EventDao eDao,MeetingDao mDao,  PasswordEncoder passwordEncoder ) {
        this.uDao = uDao;
        this.eDao = eDao;
        this.mDao = mDao;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User findByUserName(String userName){
        return uDao.findByUsername(userName);
    }

    @Transactional
    public List<User> findMatureUsers(){
        return uDao.findMatureUsers();
    }

    @Transactional
    public User findByName(String firstName,String lastName){
        return uDao.findByName(firstName,lastName);
    }

    @Transactional
    public void persist(User user) {
        Objects.requireNonNull(user);
        user.encodePassword(passwordEncoder);
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }
        uDao.persist(user);
    }

    @Transactional(readOnly = true)
    public boolean exists(int id){
        return uDao.exists(id);
    }

    @Transactional(readOnly = true)
    public boolean exists(String username){
        return uDao.findByUsername(username) != null;
    }


    @Transactional
    public void vote(Event e, User u){
        Objects.requireNonNull(e);
        Objects.requireNonNull(u);
        boolean in = false;
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = uDao.findByUsername(username);
        Meeting m = e.getMeeting();
        for(User p : m.getParticipants()){
            if(user.getId() == p.getId() ){
                in = true;
                break;
            }
        }
        if(in){
            e.vote(u);
            eDao.update(e);
        }

    }

    @Transactional
    public User getUser(Integer id){
        return uDao.find(id);
    }

    // add cascade remove
    @Transactional(readOnly = true)
    public void remove(User user){
        if(user.getRole() != Role.ADMIN){
            uDao.remove(user);
        }
    }

    // TODO how to use with rest ? - probably useless , call js function in frontend to create Meeting json entity;
    public Meeting createMeeting(User organizer, LocalDateTime voteDeadline , List<User> p) {
        Objects.requireNonNull(organizer);
        Objects.requireNonNull(voteDeadline);
        Meeting meeting = new Meeting();
        meeting.setOrganizer(organizer);
        meeting.setVoteDeadline(voteDeadline);
        meeting.setParticipants(p);
        meeting.setNumberOfVotes(0);
        return meeting;
    }


    //can be done by admin or organizer of meeting
    @Transactional
    public void addParticipantToMeeting(Meeting m , Integer p){
        Objects.requireNonNull(m);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = uDao.findByUsername(username);
        if(user.getRole()==Role.ADMIN || m.getOrganizer() == user ){
            if(uDao.exists(p)){
                User add = uDao.find(p);
                m.addParticipant(add);
            }
            mDao.update(m);
        }
        //throw exception
    }

    @Transactional
    public void addParticipantsToMeeting(Meeting m , List<User> participants){
        Objects.requireNonNull(m);
        Objects.requireNonNull(participants);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = uDao.findByUsername(username);
        if(m.getOrganizer() == user || user.getRole()==Role.ADMIN) {

            for (User p : participants) {
                m.addParticipant(p);
            }
        }
        mDao.update(m);

        //throw exception in user != m.getOrganizer()
    }

    @Transactional
    public void removeParticipantFromMeeting(Meeting m , int participantId){
        Objects.requireNonNull(m);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = uDao.findByUsername(username);
        if(m.getOrganizer() == user || user.getRole()==Role.ADMIN){
            m.removeParticipant(participantId);
            mDao.update(m);
        }
    }

    @Transactional
    public void leaveMeeting(Meeting m , int participantId){
        Objects.requireNonNull(m);
        boolean ok = false;
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = uDao.findByUsername(username);
        for(User u : m.getParticipants()){
           if(u.getId() == user.getId()){
               ok = true;
           }
        }
        if(ok || user.getRole()==Role.ADMIN){
            m.removeParticipant(participantId);
            mDao.update(m);
            uDao.update(user);
        }
    }

    @Transactional
    public List<Meeting> getAllOrganizedMeetings(int organizerId) {
        User org = uDao.find(organizerId);
        return mDao.findAllByOrganizer(org);
    }

    @Transactional
    public void addPersonalEventToMeeting(Meeting m , PersonalEvent e) {
        Objects.requireNonNull(m);
        Objects.requireNonNull(e);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = uDao.findByUsername(username);
        if(m.getOrganizer() == user || user.getRole()==Role.ADMIN){

            eDao.persist(e); // ZLE DO PICE kurva
            m.addPersonalEvent(e);
            mDao.update(m);
        }
    }

    @Transactional
    public void addOnlineEventToMeeting(Meeting m , OnlineEvent e) {
        Objects.requireNonNull(m);
        Objects.requireNonNull(e);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = uDao.findByUsername(username);
        if(m.getOrganizer() == user || user.getRole()==Role.ADMIN){

            eDao.persist(e); //
            m.addOnlineEvent(e);
            mDao.update(m);
        }
    }

    @Transactional
    public void removeEventFromMeeting(Meeting m , int eventId) {
        Objects.requireNonNull(m);
        Objects.requireNonNull(eventId);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = uDao.findByUsername(username);
        if(m.getOrganizer() == user || user.getRole()==Role.ADMIN){
            Event e = eDao.find(eventId);
            eDao.remove(e);
            mDao.update(m);
        }
    }

    @Transactional
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public void removeEvent(int eventId) {
        Objects.requireNonNull(eventId);
        Event e = eDao.find(eventId);
        eDao.remove(e);
    }

    @Transactional
    public void removeMeeting(int meetingId) {
        Objects.requireNonNull(meetingId);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = uDao.findByUsername(username);
        Meeting m = mDao.find(meetingId);
        if(m.getOrganizer() == user || user.getRole()==Role.ADMIN){
            mDao.remove(m);
        }

    }

    @Transactional
    public Event chooseEventAutomatically(Meeting m) {
        Objects.requireNonNull(m);
        List<Event> events = m.getEvents();
        Event winnerEvent = events.get(0);
        for(Event e : events){
            if(e.getVoters().size() > winnerEvent.getVoters().size()){
                winnerEvent = e;
            }
        }
        winnerEvent.setApproved(true);
        eDao.update(winnerEvent);
        return winnerEvent;
    }

    @Transactional
    public void chooseEventManually(Meeting m,Event e) {
        Objects.requireNonNull(m);
        if(!m.getEvents().contains(e))return;
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = uDao.findByUsername(username);
        if(m.getOrganizer() == user || user.getRole()==Role.ADMIN){
            boolean alreadyChosen = m.getEvents().stream().anyMatch(ev->ev.isApproved());
            /*If there already is an approved event, don't approve this one*/
            if(!alreadyChosen)e.setApproved(true);
            eDao.update(e);
        }
        //throw exception in other way
    }

    /*
    @Transactional
    public void RemoveFromMeeting(User p, Meeting m){
        Objects.requireNonNull(p);
        Objects.requireNonNull(m);
        p.RemoveFromMeeting(m);
        m.removeParticipant(p.getId());
        mDao.update(m);
        uDao.update(p);
    }
    */

    @Transactional
    public List<Meeting> getParticipatedMeetings(Integer participantId){
        User org = uDao.find(participantId);
        return mDao.findAllByParticipant(org);
    }

}
