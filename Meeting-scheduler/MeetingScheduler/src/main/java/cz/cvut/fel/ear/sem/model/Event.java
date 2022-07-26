package cz.cvut.fel.ear.sem.model;


import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;


@Entity
public class Event extends AbstractEntity{

    private boolean isApproved;

    @Column(columnDefinition = "TIMESTAMP")
    private LocalDateTime date;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Meeting meeting;

    @ManyToMany
    @OrderBy("lastName ASC")
    private List<User> voters = new ArrayList<>();

    public boolean isApproved() {
        return isApproved;
    }

    public void setApproved(boolean approved) {
        isApproved = approved;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public Meeting getMeeting() {
        return meeting;
    }

    public void setMeeting(Meeting meeting) {
        this.meeting = meeting;
    }

    public List<User> getVoters() {
        return voters;
    }

    public void setVoters(List<User> voters) {
        this.voters = voters;
    }

    public boolean vote(User u){
        Objects.requireNonNull(u);

        boolean alreadyVoted = meeting.getEvents().stream()
                .anyMatch(e ->e.getVoters().contains(u));

        if (alreadyVoted)return false;
        voters.add(u);
        return true;
    }
}
