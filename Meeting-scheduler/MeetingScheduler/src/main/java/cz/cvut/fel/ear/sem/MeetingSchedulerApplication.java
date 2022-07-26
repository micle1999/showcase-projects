package cz.cvut.fel.ear.sem;

import cz.cvut.fel.ear.sem.model.User;
import cz.cvut.fel.ear.sem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
@EntityScan(basePackages = {"cz.cvut.fel.ear.sem.model"})
public class MeetingSchedulerApplication {


    public static void main(String[] args) {
            SpringApplication.run(MeetingSchedulerApplication.class, args);
        }
    }

