package cz.cvut.fel.ear.sem.model;

import javax.persistence.*;

@Embeddable
public class Location  {

    @Basic
    private String description;

    @Embedded
    private Address address;

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }
}
