package cz.cvut.fel.ear.sem.model;

import org.springframework.core.annotation.Order;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;


@Entity
public class Meeting extends AbstractEntity {

    @Basic
    private int numberOfVotes;

    @Column(columnDefinition = "TIMESTAMP")
    private LocalDateTime voteDeadline;

    @ManyToOne
    @JoinColumn
    //private Organizer organizer;
    private User organizer;

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(nullable = false)
    private List<Event> events = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER)
    /*
    @JoinTable(
            name = "MEETING_PARTICIPANTS",
            joinColumns = {@JoinColumn(name = "meeting_id")},
            inverseJoinColumns = {@JoinColumn(name = "participant_id")}
    )
    */
    //Refactored
    @OrderBy("lastName ASC")
    private List<User> participants;

    public int getNumberOfVotes() {
        return numberOfVotes;
    }

    public void setNumberOfVotes(int numberOfVotes) {
        this.numberOfVotes = numberOfVotes;
    }

    public User getOrganizer() {
        return organizer;
    }

    public void setOrganizer(User organizer) {
        this.organizer = organizer;
    }

    public List<Event> getEvents() {
        return events;
    }

    public void setEvents(List<Event> events) {
        this.events = events;
    }

    public void setVoteDeadline(LocalDateTime date) {
        this.voteDeadline = date;
    }

    public LocalDateTime getVoteDeadline() {
        return voteDeadline;
    }

    public List<User> getParticipants() {
        return participants;
    }

    public void setParticipants(List<User> participants) {
        this.participants = participants;
    }
                                //User
    public void addParticipant(User participant){
        Objects.requireNonNull(participant);
        if(participants == null)participants = new ArrayList<>() ;
        this.participants.add(participant);

    }

    public void removeParticipant(int id){
        //Refactored
        User toRemove = null;
        for(User p : participants){
            if (p.getId() == id) toRemove = p;
        }
        
        if(toRemove != null)participants.remove(toRemove);
    }

    public void addPersonalEvent(PersonalEvent e){
        if(e != null){
            this.events.add(e);
        }
    }

    public void addOnlineEvent(OnlineEvent e){
        if(e != null){
            this.events.add(e);
        }
    }

    public void addEvent(Event e){
        if(e != null){
            this.events.add(e);
        }
    }


}
