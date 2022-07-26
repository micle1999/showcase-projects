package cz.cvut.fel.ear.sem.model;

import org.springframework.security.crypto.password.PasswordEncoder;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@NamedQueries({
        @NamedQuery(name = "User.findByUsername", query = "SELECT u FROM User u WHERE u.username = :username"),
        @NamedQuery(name = "User.findMatureUsers", query = "SELECT u FROM User u WHERE u.age >= 18"),
        @NamedQuery(name = "User.findByName", query = "SELECT u FROM User u WHERE u.firstName = :firstName AND u.lastName = :lastName")
})
@Table(name = "Users")
public class User extends AbstractEntity{

    @Basic
    @Column(nullable = false)
    private int age;

    @Basic
    @Column(nullable = false)
    private String email;

    @Basic
    @Column(nullable = false)
    private String firstName;

    @Basic
    @Column(nullable = false)
    private String lastName;

    @Basic
    @Column(nullable = false , unique = true)
    private String username;

    @Basic
    @Column(nullable = false)
    private String password;

    @Basic
    @Column(nullable = false)
    private int personalId;

    @Basic
    @Column(nullable = false)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean logged = false;

    public boolean isLogged() {
        return logged;
    }

    public void setLogged(boolean logged) {
        this.logged = logged;
    }

    @Embedded
    private Address address; //do we really need multiple addresses in our application?

    //Refactored from Organizer
    @OneToMany(mappedBy = "organizer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Meeting> organizedMeetings;

    //Refactored from Participant
    @ManyToMany(mappedBy = "participants", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Meeting> participatedMeetings = new ArrayList<>();


    //Refactored from Participant
    public void RemoveFromMeeting(Meeting m){
        Objects.requireNonNull(m);
        if(participatedMeetings.contains(m)){
            participatedMeetings.remove(m);
        }
    }

    //Refactored from Participant
    public List<Meeting> getParticipatedMeetings() {
        return participatedMeetings;
    }

    //Refactored from Participant
    public void setParticipatedMeetings(List<Meeting> participatedMeetings) {
        this.participatedMeetings = participatedMeetings;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getPersonalId() {
        return personalId;
    }

    public void setPersonalId(int personalId) {
        this.personalId = personalId;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    public void encodePassword(PasswordEncoder encoder) {
        this.password = encoder.encode(password);
    }

    public void erasePassword() {
        this.password = null;
    }

    @Override
    public String toString() {
        return "User : " +
                "age=" + age +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", personalId=" + personalId +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", address=" + address +
                '.';
    }
}
