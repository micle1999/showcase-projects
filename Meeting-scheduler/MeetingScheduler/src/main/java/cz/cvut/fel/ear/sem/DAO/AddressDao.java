package cz.cvut.fel.ear.sem.DAO;

import cz.cvut.fel.ear.sem.model.Address;
import org.springframework.stereotype.Repository;

@Repository
public class AddressDao extends BaseDao<Address> {
    public AddressDao() {
        super(Address.class);
    }
}
