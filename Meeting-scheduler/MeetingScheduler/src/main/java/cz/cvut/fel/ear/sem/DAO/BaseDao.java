package cz.cvut.fel.ear.sem.DAO;

import cz.cvut.fel.ear.sem.DAO.GenericDao;
import cz.cvut.fel.ear.sem.Exception.EarException;
import org.springframework.lang.NonNull;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.Collection;
import java.util.List;

public class BaseDao<T> implements GenericDao<T> {
    @PersistenceContext
    EntityManager em;

    protected Class<T> type;

    public BaseDao(Class<T> type) {
        this.type = type;
    }

    @Override
    public T find( Integer id) {
        return em.find(type,id);
    }

    @Override
    public List<T> findAll(){
        return em.createQuery("SELECT c FROM "+type.getSimpleName()+ " c",type).getResultList();
    }

    @Override
    public void persist(@NonNull T entity) {
        try{
            em.persist(entity);
        }
        catch(RuntimeException e){
            throw new EarException(e);
        }

    }

    @Override
    public void persist(Collection<T> entities) {
        if(entities == null || entities.isEmpty())return;
        entities.forEach(e -> persist(e));
    }

    @Override
    public T update(T entity) {
        try{
            return em.merge(entity);
        }
        catch(RuntimeException e){
            throw new EarException(e);
        }

    }

    @Override
    public void remove(T entity){
        if (!em.contains(entity)) {
            entity = em.merge(entity);
        }
        em.remove(entity);
    }

    @Override
    public boolean exists(Integer id) {
        return find(id) != null;
    }
}
