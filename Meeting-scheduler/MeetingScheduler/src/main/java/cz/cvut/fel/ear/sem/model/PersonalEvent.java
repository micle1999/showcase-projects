package cz.cvut.fel.ear.sem.model;


import javax.persistence.*;

@Entity
@DiscriminatorValue("PERSONAL")
public class PersonalEvent extends Event {

    @Embedded
    private Location location;

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }
}
