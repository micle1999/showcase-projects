package cz.cvut.fel.ear.sem.rest;

import com.fasterxml.jackson.core.type.TypeReference;
import cz.cvut.fel.ear.sem.model.Event;
import cz.cvut.fel.ear.sem.model.User;
import cz.cvut.fel.ear.sem.service.EventService;
import cz.cvut.fel.ear.sem.service.UserService;
import org.eclipse.persistence.internal.sessions.factories.ObjectPersistenceRuntimeXMLProject_11_1_1;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.lang.reflect.Array;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
public class UserControllerTest extends BaseControllerTestRunner{

    @Mock
    private UserService us;

    @Mock
    private EventService es;
    @InjectMocks
    private UserController uc;

    @Before
    public void setUp() {
        MockitoAnnotations.initMocks(this);
        super.setUp(uc);
    }

    @Test
    public void gettingBy_UserInDatabase_returnTheUser() throws Exception {

        User u = new User();
        u.setId(5);
        u.setLastName("Smith");

        when(us.getUser(u.getId())).thenReturn(u);
        final MvcResult mvcResult = mockMvc.perform(get("/rest/user/get/" + u.getId())).andReturn();
        final User result = readValue(mvcResult, User.class);
        assertNotNull(result);
        assertEquals(u.getId(), result.getId());
        assertEquals(u.getLastName(), result.getLastName());
    }

    @Test
    public void registerUser_registersSuccesfully() throws Exception {
        User u = new User();
        u.setLastName("Smith");
        u.setFirstName("Josh");

        mockMvc.perform(post("/rest/user").content(toJson(u)).contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(status().isCreated());
        final ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(us).persist(captor.capture());
        assertEquals(u.getLastName(), captor.getValue().getLastName());
    }

    @Test
    public void removingUser_removesSuccesfully() throws Exception {
        User u = new User();
        u.setLastName("Smith");
        u.setId(1);
        when(us.getUser(u.getId())).thenReturn(u);

        mockMvc.perform(delete("/rest/user/" +u.getId())).andExpect(status().isNoContent());
        verify(us).remove(u);

    }

    @Test
    public void testVoting_userVotesForEvent_succesfullyAddsVote() throws Exception {
        User u = new User();
        u.setId(1);
        Event e = new Event();
        e.setId(2);

        when(us.getUser(u.getId())).thenReturn(u);
        when(es.getEvent(e.getId())).thenReturn(e);

        mockMvc.perform(put("/rest/user/" +u.getId() + "/vote/" + e.getId()).content(toJson(e)).contentType(
                MediaType.APPLICATION_JSON_VALUE)).andExpect(status().isNoContent());
        verify(us).vote(e,u);

    }





}
