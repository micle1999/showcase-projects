package cz.cvut.fel.ear.sem.rest;

import cz.cvut.fel.ear.sem.model.*;
import cz.cvut.fel.ear.sem.service.EventService;
import cz.cvut.fel.ear.sem.service.MeetingService;
import cz.cvut.fel.ear.sem.service.UserService;
import junit.runner.BaseTestRunner;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class MeetingControllerTest extends BaseControllerTestRunner {

    @Mock
    MeetingService ms;

    @Mock
    UserService us;

    @Mock
    EventService es;

    @InjectMocks
    private MeetingController mc;

    @Before
    public void setUp() {
        MockitoAnnotations.initMocks(this);
        super.setUp(mc);
    }

    @Test
    public void addParticipantToMeeting_succesfullyAdds() throws Exception {
        Meeting m = new Meeting();
        User u = new User();
        m.setId(1);
        u.setId(2);
        when(ms.getMeeting(m.getId())).thenReturn(m);
        when(us.getUser(u.getId())).thenReturn(u);

        mockMvc.perform(post("/rest/meeting/"+ m.getId() + "/participants/add/" + u.getId())
                .content(toJson(u)).contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(status().isCreated());
        verify(us).addParticipantToMeeting(m,u.getId());
    }

    @Test
    public void addPersonalEventToMeeting_succesfullyAdds() throws Exception {
        Meeting m = new Meeting();
        PersonalEvent e = new PersonalEvent();
        m.setId(1);
        e.setId(2);
        when(ms.getMeeting(m.getId())).thenReturn(m);
        when(es.getEvent(e.getId())).thenReturn(e);

        mockMvc.perform(post("/rest/meeting/" + m.getId() + "/events/personal")
                .content(toJson(e)).contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(status().isCreated());
        final ArgumentCaptor<PersonalEvent> captor = ArgumentCaptor.forClass(PersonalEvent.class);
        verify(us).addPersonalEventToMeeting(eq(m), captor.capture());
    }

    @Test
    public void addOnlineEventToMeeting_succesfullyAdds() throws Exception {
        Meeting m = new Meeting();
        OnlineEvent e = new OnlineEvent();
        m.setId(1);
        e.setId(2);
        when(ms.getMeeting(m.getId())).thenReturn(m);
        when(es.getEvent(e.getId())).thenReturn(e);

        mockMvc.perform(post("/rest/meeting/" + m.getId() + "/events/online")
                .content(toJson(e)).contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(status().isCreated());
        final ArgumentCaptor<OnlineEvent> captor = ArgumentCaptor.forClass(OnlineEvent.class);
        verify(us).addOnlineEventToMeeting(eq(m), captor.capture());
    }

    @Test
    public void removeParticipantFromMeeting_removesSuccesfully() throws Exception {
        Meeting m = new Meeting();
        User u = new User();
        m.setId(1);
        u.setId(2);
        when(ms.getMeeting(m.getId())).thenReturn(m);
        when(us.getUser(u.getId())).thenReturn(u);

        mockMvc.perform(put("/rest/meeting/"+ m.getId() + "/participants/" + u.getId()))
                .andExpect(status().isNoContent());
        verify(us).removeParticipantFromMeeting(m,u.getId());

    }





}
