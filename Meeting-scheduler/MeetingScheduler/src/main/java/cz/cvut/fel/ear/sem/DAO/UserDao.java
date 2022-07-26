package cz.cvut.fel.ear.sem.DAO;

import cz.cvut.fel.ear.sem.model.User;
import org.springframework.stereotype.Repository;

import javax.persistence.NoResultException;
import java.util.List;

@Repository
public class UserDao extends BaseDao<User>{
    public UserDao() {
        super(User.class);
    }

    public User findByUsername(String username) {
        try {
            return em.createNamedQuery("User.findByUsername", User.class).setParameter("username", username)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    public List<User> findMatureUsers(){
        return em.createNamedQuery("User.findMatureUsers",User.class).getResultList();
    }

    public User findByName(String firstName, String lastName) {
        try {
            return em.createNamedQuery("User.findByName", User.class)
                    .setParameter("firstName", firstName)
                    .setParameter("lastName",lastName).getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }


}
