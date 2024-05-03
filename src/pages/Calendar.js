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
                    calendar_id: event.calendar_id,
                    event_id: event.event_id,
                    title: event.title,
                    description: event.description,
                    start: event.start_time, // Convert to Date object
                    end: event.end_time, // Convert to Date object
                    location: event.location,
                    color: event.color || "#000000",
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
    const handleUpdateEvent = async () => {
        try {
            const updatedEventData = {
                calendar_id: selectedEvent.extendedProps.calendar_id,
                title: selectedEvent.title,
                description: selectedEvent.extendedProps.description,
                start_time: new Date(selectedEvent.start).toISOString(),
                end_time: new Date(selectedEvent.end).toISOString(),
                location: selectedEvent.extendedProps.location,
                color: selectedEvent.backgroundColor,
                recurring: selectedEvent.recurring,
            };
            if (selectedEvent.recurring) {
                updatedEventData.rrule = selectedEvent.rrule;
            }

            await fetch(`${URL}/calendar/${selectedCalendar}/event/${selectedEvent.extendedProps.event_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEventData),
            });
            console.log(updatedEventData)

            fetchEvents(selectedCalendar);
            setShowEventDialog(false);
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    //delete event
    const handleDeleteEvent = async () => {
        try {
            await fetch(`${URL}/calendar/${selectedCalendar}/event/${selectedEvent.extendedProps.event_id}`, {
                method: 'DELETE',
            });

            fetchEvents(selectedCalendar);
            setShowEventDialog(false);
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    // Event click handler
    const handleEventClick = (info) => {
        console.log('selectedEvent',selectedEvent)
        setSelectedEvent(info.event);
        setShowEventDialog(true)
        ;
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
                    <Form onSubmit={handleUpdateEvent}>
                        {selectedEvent && (
                    <>
                        <label htmlFor="title">
                            Title:
                            <input type="text" name="title" id="title" defaultValue={selectedEvent.title}/>
                        </label>
                        <label htmlFor="description">
                            Description:
                            <textarea name="description" id="description" defaultValue={selectedEvent.extendedProps.description}/>
                        </label>
                        <label htmlFor="start">
                            Start:
                            <input type="datetime-local" name="start_time" id="start_time" defaultValue={selectedEvent.start}/>
                        </label>
                        <label htmlFor="end">
                            End:
                            <input type="datetime-local" name="end_time" id="end_time" defaultValue={selectedEvent.end}/>
                        </label>
                        <label htmlFor="location">
                            Location:
                            <input type="text" name="location" id="location" defaultValue={selectedEvent.location}/>
                        </label>
                        <label htmlFor="color">
                            Color:
                            <input type="color" name="color" id="color" defaultValue={selectedEvent.color || "#000000"} />
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
                        <Button onClick={handleDeleteEvent} color="error">Delete</Button>
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