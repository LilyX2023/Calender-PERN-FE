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


const Landing = () => {
    const calendars = useLoaderData();
    const [selectedCalendar, setSelectedCalendar] = useState(null);
    const [events, setEvents] = useState([]);
    const [showEventDialog, setShowEventDialog] = useState(false); // State to control event dialog visibility
    const [selectedEvent, setSelectedEvent] = useState(null); // State to store selected event details
    const [showRecurringFields, setShowRecurringFields] = useState(false); // State to control visibility of recurring fields
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
          //console.log(formData)
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
                    event_id: event.event_id,
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
    //update event


    // Event click handler
    const handleEventClick = (info) => {
        console.log('info',info)
        setSelectedEvent(info.event);
        setShowEventDialog(true);
    };
    // Toggle visibility of recurring fields
    const handleRecurringCheckboxChange = (e) => {
        setShowRecurringFields(e.target.checked);
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
                    <Form>
                        {selectedEvent && (
                    <>
                        <label htmlFor="title">
                            Title:
                            <input type="text" name="title" id="title" defaultValue={selectedEvent.title}/>
                        </label>
                        <label htmlFor="description">
                            Description:
                            <textarea name="description" id="description" defaultValue={selectedEvent.description}/>
                        </label>
                        <label htmlFor="start">
                            Start:
                            <input type="datetime-local" name="start_time" id="start_time" defaultValue={selectedEvent.start_time}/>
                        </label>
                        <label htmlFor="end">
                            End:
                            <input type="datetime-local" name="end_time" id="end_time" defaultValue={selectedEvent.end_time}/>
                        </label>
                        <label htmlFor="location">
                            Location:
                            <input type="text" name="location" id="location" defaultValue={selectedEvent.location}/>
                        </label>
                        <label htmlFor="color">
                            Color:
                            <input type="color" name="color" id="color" defaultValue={selectedEvent.color}/>
                        </label>

                        <label htmlFor="recurring">
                            Recurring:
                            <input type="checkbox" name="recurring" id="recurring" checked={selectedEvent.recurring}
                                onChange={handleRecurringCheckboxChange}
                            />
                        </label>
                        {showRecurringFields && (
                            <>
                                <label htmlFor="rruleFreq">
                                    Frequency:
                                    <select name="rruleFreq" id="rruleFreq" defaultValue={selectedEvent.rruleFreq}>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </label>
                                <label htmlFor="rruleUntil">
                                    Until:
                                    <input type="datetime-local" name="rruleUntil" id="rruleUntil" defaultValue={selectedEvent.rruleUntil}/>
                                </label>
                                <label htmlFor="rruleDtstart">
                                    Start Date:
                                    <input type="datetime-local" name="rruleDtstart" id="rruleDtstart" defaultValue={selectedEvent.rruleDtstart} />
                                </label>
                            </>
                        )}
                        <button type="submit">Update</button>
                    </>
                        )}
                    </Form>
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