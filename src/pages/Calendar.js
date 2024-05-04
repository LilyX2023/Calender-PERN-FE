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
    //edit the event_id and update event properties
    const [updatedEventId, setUpdatedEventId] = useState(null);
    //update  event_title and etc:
    const [updatedTitle, setupdatedTitle] = useState('');
    const [updatedDescription, setupdatedDescription] = useState('');
    const [updatedStart_time, setUpdatedStart] = useState('');
    const [updatedEnd_time, setUpdatedEnd] = useState('');
    const [updatedLocation, setUpdatntedLocation] = useState('');
    const [updatedEventcolor, setUpdatedEventcolor] = useState('#000000'); // Default color
    const [updatedRecurring, setUpdatedRecurring] = useState(false);
    const [updatedRruleFreq, setUpdatedRruleFreq] = useState('weekly');
    const [updatedRruleUntil, setUpdatedRruleUntil] = useState('');
    const [updatedRruleDtstart, setUpdatedRruleDtstart] = useState('');
  

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
          formData.eventcolor = formData.backgroundColor; // Set eventColor as backgroundColor
          delete formData.backgroundColor; // Remove backgroundColor from formData
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
                    start:new Date(event.start_time), // Convert to Date object
                    end: new Date(event.end_time), // Convert to Date object
                    location: event.location,
                    backgroundColor: event.eventcolor || "#000000",
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

    //Function to set up editing of a event
    const handleEdit = (id) =>{
        const eventToEdit = events.find(event=> event.event_id === id);
        setUpdatedEventId(id);
        setupdatedTitle(eventToEdit.title);
        setupdatedDescription(eventToEdit.description);
        setUpdatedStart(eventToEdit.start);
        


    }
    //update event
    const handleUpdateEvent = async () => {
        console.log('selectedEvent:', selectedEvent);
        try {
            
            const updatedEventData = {
                calendar_id: selectedEvent._def.extendedProps.calendar_id,
                event_id:selectedEvent._def.extendedProps.event_id,
                title: selectedEvent._def.title,
                description: selectedEvent._def.extendedProps.description,
                start_time: selectedEvent._instance.range.start.toISOString(),
                end_time: selectedEvent._instance.range.end.toISOString(),
                location: selectedEvent._def.extendedProps.location,
                eventcolor: selectedEvent._def.ui.backgroundColor,
                recurring: selectedEvent._def.extendedProps.recurring,
            };
            if (selectedEvent._def.extendedProps.recurring) {
                updatedEventData.rrule = {
                    freq: selectedEvent._def.recurringDef.typeData.
                    rruleSet._rrule.freq,
                    until: selectedEvent._def.recurringDef.typeData.
                    rruleSet._rrule.until,
                    dtstart: selectedEvent._def.recurringDef.typeData.
                    rruleSet._rrule.dtstart
                };
            
            }else {
                updatedEventData.rrule = null; // Add rrule as null when recurring is false
            }

            await fetch(`${URL}/calendar/${selectedCalendar}/event/${selectedEvent.extendedProps.event_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEventData),
            });
            console.log('updated_event', updatedEventData)

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
        console.log('selectedEvent:', selectedEvent);
        setSelectedEvent(info.event);
        setShowEventDialog(true)
        ;
    };
    // Toggle visibility of recurring fields
    const handleRecurringCheckboxChange = (e) => {
        const isChecked = e.target.checked;
        setShowRecurringFields(isChecked);
        setSelectedEvent(prevEvent => ({
            ...prevEvent,
            recurring: isChecked
        }));
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
                                        <input type="text" name="title" id="title" defaultValue={selectedEvent.title} />
                                    </label>
                                    <label htmlFor="description">
                                        Description:
                                        <textarea name="description" id="description" defaultValue={selectedEvent.extendedProps.description} />
                                    </label>
                                    <label htmlFor="start">
                                        Start:
                                        <input 
                                            type="datetime-local" 
                                            name="start_time" 
                                            id="start_time" 
                                            defaultValue={selectedEvent && selectedEvent.start ? 
                                                new Date(selectedEvent.start.getTime() - selectedEvent.start.getTimezoneOffset() * 60000)
                                                    .toISOString()
                                                    .slice(0, -8)
                                                : ''} 
                                        />
                                    </label>
                                    <label htmlFor="end">
                                        End:
                                        <input 
                                            type="datetime-local" 
                                            name="end_time" 
                                            id="end_time" 
                                            defaultValue={selectedEvent && selectedEvent.end ? 
                                                new Date(selectedEvent.end.getTime() - selectedEvent.end.getTimezoneOffset() * 60000)
                                                    .toISOString()
                                                    .slice(0, -8)
                                                : ''} 
                                        />
                                    </label>
                                    <label htmlFor="location">
                                        Location:
                                        <input type="text" name="location" id="location" defaultValue={selectedEvent.extendedProps.location} />
                                    </label>
                                    <label htmlFor="backgroundColor">
                                        Color:
                                        <input type="color" name="eventcolor" id="eventcolor" defaultValue={selectedEvent._def.ui.backgroundColor}
                                        />
                                    </label>

                                    <label htmlFor="recurring">
                                        Recurring:
                                        <input type="checkbox" name="recurring" id="recurring" checked={selectedEvent.extendedProps.recurring} onChange={handleRecurringCheckboxChange} />
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
                                                <input 
                                                    type="datetime-local" 
                                                    name="rruleUntil" 
                                                    id="rruleUntil" 
                                                    defaultValue={selectedEvent && selectedEvent.rruleUntil ? 
                                                        new Date(selectedEvent.rruleUntil.getTime() - selectedEvent.rruleUntil.getTimezoneOffset() * 60000)
                                                            .toISOString()
                                                            .slice(0, -8)
                                                        : ''} 
                                                />
                                            </label>
                                            <label htmlFor="rruleDtstart">
                                                Start Date:
                                                <input 
                                                    type="datetime-local" 
                                                    name="rruleDtstart" 
                                                    id="rruleDtstart" 
                                                    defaultValue={selectedEvent && selectedEvent.rruleDtstart ? 
                                                        new Date(selectedEvent.rruleDtstart.getTime() - selectedEvent.rruleDtstart.getTimezoneOffset() * 60000)
                                                            .toISOString()
                                                            .slice(0, -8)
                                                        : ''} 
                                                />
                                            </label>
                                        </>
                                    )}
                                    <Button type="submit">Update</Button>
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