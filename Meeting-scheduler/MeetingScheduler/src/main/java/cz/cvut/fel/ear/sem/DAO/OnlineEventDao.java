package cz.cvut.fel.ear.sem.DAO;

import cz.cvut.fel.ear.sem.model.OnlineEvent;
import org.springframework.stereotype.Repository;

@Repository
public class OnlineEventDao extends BaseDao<OnlineEvent> {
    public OnlineEventDao() {
        super(OnlineEvent.class);
    }
}
