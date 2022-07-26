package cz.cvut.fel.ear.sem.model;

public enum Role {
    ADMIN("ROLE_ADMIN"), USER("ROLE_USER");

    private final String name;

    Role(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return name;
    }
}
