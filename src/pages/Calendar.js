// Landing.js
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from '@fullcalendar/rrule';
import { useLoaderData, useNavigate, Form } from "react-router-dom";
import EventForm from './EventForm'; // Import the EventForm component
import { deleteAction } from '../actions';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'; // Import Material UI components
import moment from 'moment'; // Import Moment.js


const Landing = () => {
    const calendars = useLoaderData();
    const [selectedCalendar, setSelectedCalendar] = useState(null);
    const [events, setEvents] = useState([]);
    const [showEventDialog, setShowEventDialog] = useState(false); // State to control event dialog visibility
    const [selectedEvent, setSelectedEvent] = useState(null); // State to store selected event details
    const navigate = useNavigate();// function to navigate to edit page for event
    const URL = process.env.REACT_APP_URL;

    //Use useEffect to get data from seleted calendar
    useEffect(() => {
        if (selectedCalendar) {
            fetchEvents(selectedCalendar);
        }
    }, [selectedCalendar]);

    const handleCalendarChange = (calendarId) => {
        setSelectedCalendar(calendarId);
    };

    //add event
    const handleEventSubmit = async (formData) => {
        try {
          // Include the calendar_id in the formDat
          formData.calendar_id = selectedCalendar;
          formData.start_time = new Date(formData.start_time).toISOString();
          formData.end_time = new Date(formData.end_time).toISOString();
          console.log(formData)
               await fetch(`${URL}/calendar/${selectedCalendar}/event`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData), // Send formData as JSON string
              });
          
          fetchEvents(selectedCalendar); // Refresh events after adding a new one
        } catch (error) {
          console.error('Error creating event:', error);
        }
      };

    //show all the events
    const fetchEvents = async (calendarId) => {
        try {
            const response = await fetch(`${URL}/calendar/${calendarId}/event`);
            const eventsData = await response.json();
            
            const formattedEvents = eventsData.map(event => {
                const formattedEvent = {
                    title: event.title,
                    description: event.description,
                    start: event.start_time,
                    end: event.end_time, 
                    location: event.location,
                    color: event.color,
                    recurring: event.recurring,
                };
                if (event.recurring) {
                    formattedEvent.rrule = event.rrule;
                }
    
                return formattedEvent;
            });
          
            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    // Event click handler
    const handleEventClick = (info) => {
        setSelectedEvent(info.event);
        setShowEventDialog(true);
    };

    // Close event dialog
    const handleCloseEventDialog = () => {
        setShowEventDialog(false);
    };

    return (
        <div>
            <h3>Calendar</h3>
            <select onChange={(e) => handleCalendarChange(e.target.value)}>
                <option value="">Select a Calendar</option>
                {calendars.slice(0).reverse().map(calendar => (
                    <option key={calendar.calendar_id} value={calendar.calendar_id}>
                        {calendar.calendar_name}
                    </option>
                ))}
            </select>


            {selectedCalendar && (
                <>
                <EventForm onSubmit={handleEventSubmit} />
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
                    initialView={'timeGridWeek'}
                    headerToolbar={{
                        start: 'today prev,next',
                        center: 'title',
                        end: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    height={"90vh"}
                    events={events}
                    eventClick={handleEventClick} // Handle event click
                />
                {/* Event dialog */}
                <Dialog open={showEventDialog} onClose={handleCloseEventDialog}>
                    <DialogTitle>{selectedEvent && selectedEvent.title}</DialogTitle>
                    <DialogContent>
                        <p>{selectedEvent && selectedEvent.title}</p>
                        <p>{selectedEvent && selectedEvent.description}</p>
                        <p>{/* Add other event details here */}</p>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEventDialog} color="primary">Close</Button>
                    </DialogActions>
            </Dialog>

            </>
            )}
        </div>
    );
};

export default Landing;