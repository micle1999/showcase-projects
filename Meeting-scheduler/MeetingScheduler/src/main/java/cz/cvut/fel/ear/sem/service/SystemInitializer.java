package cz.cvut.fel.ear.sem.service;

import cz.cvut.fel.ear.sem.model.Role;
import cz.cvut.fel.ear.sem.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import javax.annotation.PostConstruct;

@Component
public class SystemInitializer {

    private static final Logger LOG = LoggerFactory.getLogger(SystemInitializer.class);

    private final PlatformTransactionManager txManager;

    private static final String ADMIN_USERNAME = "admin";

    private final UserService userService;

    @Autowired
    public SystemInitializer(UserService userService, PlatformTransactionManager txManager) {
        this.txManager = txManager;
        this.userService = userService;
    }

    @PostConstruct
    private void initSystem() {
        TransactionTemplate txTemplate = new TransactionTemplate(txManager);
        txTemplate.execute((status) -> {
            generateAdmin("System");
            generateAdmin("Test");
            return null;
        });
    }


    private void generateAdmin(String name) {
        if (userService.exists(ADMIN_USERNAME)) {
            return;
        }
        final User admin = new User();
        admin.setUsername(ADMIN_USERNAME);
        admin.setFirstName(name);
        admin.setLastName("Administrator");
        admin.setPassword("adm1n");
        admin.setRole(Role.ADMIN);
        admin.setEmail("admin@meetingsched.com");
        admin.setPhoneNumber("0908142345");
        LOG.info("Generated admin user with credentials " + admin.getUsername() + "/" + admin.getPassword());
        userService.persist(admin);
    }


}
