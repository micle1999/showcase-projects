package cz.cvut.fel.ear.sem.model;

import javax.persistence.Basic;
import javax.persistence.Embeddable;

@Embeddable
public class Address{

    @Basic
    private String street;

    @Basic
    private String city;

    @Basic
    private int houseNumber;

    @Basic
    private String postalCode;

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public int getHouseNumber() {
        return houseNumber;
    }

    public void setHouseNumber(int houseNumber) {
        this.houseNumber = houseNumber;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    @Override
    public String toString() {
        return "Address :" +
                "street='" + street + '\'' +
                ", city='" + city + '\'' +
                ", houseNumber=" + houseNumber +
                ", postalCode='" + postalCode + '\'' +
                '}';
    }
}
