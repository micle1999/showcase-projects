package cz.cvut.fel.ear.sem.DAO;

import cz.cvut.fel.ear.sem.model.Location;
import org.springframework.stereotype.Repository;

@Repository
public class LocationDao extends BaseDao<Location>{
    public LocationDao() {
        super(Location.class);
    }
}
