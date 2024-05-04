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
    const [updatedTitle, setUpdatedTitle] = useState('');
    const [updatedDescription, setUpdatedDescription] = useState('');
    const [updatedStart_time, setUpdatedStart] = useState('');
    const [updatedEnd_time, setUpdatedEnd] = useState('');
    const [updatedLocation, setUpdatedLocation] = useState('');
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
// Function to set up editing of an event
const handleEdit = (event) => {
    setSelectedEvent(event);  // Ensure you are setting the selected event
    setUpdatedEventId(event.event_id);
    setUpdatedTitle(event.title);
    setUpdatedDescription(event.extendedProps.description);
    setUpdatedStart(event.start ? new Date(event.start.getTime() - event.start.getTimezoneOffset() * 60000).toISOString().slice(0, -8) : '');
    setUpdatedEnd(event.end ? new Date(event.end.getTime() - event.end.getTimezoneOffset() * 60000).toISOString().slice(0, -8) : '');    
    setUpdatedLocation(event.extendedProps.location);
    setUpdatedEventcolor(event.backgroundColor || '#000000');
    setUpdatedRecurring(event.recurring);
    if (event.recurring) {
        setUpdatedRruleFreq(event.rrule.freq);
        setUpdatedRruleUntil(event.rrule.until);
        setUpdatedRruleDtstart(event.rrule.dtstart);
    }
};

   // Update event
    const handleUpdateEvent = async (event_id) => {
        console.log('Selected Event:', selectedEvent);
        console.log("Updated Start Time:", updatedStart_time);
        console.log("Updated End Time:", updatedEnd_time);

        try {
            const startDate = new Date(updatedStart_time);
            const endDate = new Date(updatedEnd_time);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.error("Invalid date provided");
                return; // Exit the function if dates are not valid
            }

            const updatedEventData = {
                calendar_id: selectedEvent._def.extendedProps.calendar_id,
                event_id: selectedEvent._def.extendedProps.event_id,
                title: updatedTitle,
                description: updatedDescription,
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
                location: updatedLocation,
                eventcolor: updatedEventcolor,
                recurring: updatedRecurring,
                rrule: updatedRecurring ? {
                    freq: updatedRruleFreq,
                    until: new Date(updatedRruleUntil).toISOString(),
                    dtstart: new Date(updatedRruleDtstart).toISOString()
                } : null
            };

            await fetch(`${URL}/calendar/${selectedCalendar}/event/${selectedEvent._def.extendedProps.event_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEventData),
            });

            setEvents(events.map(event => {
                if (event.event_id === event_id) {
                    return {
                        ...event,
                        title: updatedTitle,
                        description: updatedDescription,
                        start_time: updatedStart_time,
                        end_time: updatedEnd_time,
                        location: updatedLocation,
                        eventcolor: updatedEventcolor,
                        recurring: updatedRecurring,
                        freq: updatedRruleFreq,
                        until: updatedRruleUntil,
                        dtstart: updatedRruleDtstart,
                    };
                }
                return event;
            }));

            setUpdatedEventId(null);
            setUpdatedTitle('');
            setUpdatedDescription('');
            setUpdatedStart('');
            setUpdatedEnd('');
            setUpdatedLocation('');
            setUpdatedEventcolor('#000000');
            setUpdatedRecurring(false);
            setUpdatedRruleFreq('weekly');
            setUpdatedRruleUntil('');
            setUpdatedRruleDtstart('');

            console.log('Updated event data', updatedEventData);
            // Fetch events, close dialog after submit
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
// Event click handler
    const handleEventClick = (clickInfo) => {
        console.log('Clicked Event:', clickInfo.event);
        setSelectedEvent(clickInfo.event);
        handleEdit(clickInfo.event);  // Call handleEdit with the event details
        setShowEventDialog(true);
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
        <h3 style={{ textAlign: 'center' }}>Calendar</h3>


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
                    height={"85vh"}
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
                                        <input type="text" name="title" id="title" value={updatedTitle} onChange={(e) => setUpdatedTitle(e.target.value)}/>
                                    </label>
                                    <label htmlFor="description">
                                        Description:
                                        <textarea name="description" id="description" value={updatedDescription} onChange={(e) => setUpdatedDescription(e.target.value)}/>
                                    </label>
                                    <label htmlFor="start">
                                        Start:
                                        <input 
                                            type="datetime-local" 
                                            name="start_time" 
                                            id="start_time" 
                                            value={updatedStart_time}
                                                onChange={(e) => setUpdatedStart(e.target.value)} 
                                        />
                                    </label>
                                    <label htmlFor="end">
                                        End:
                                        <input 
                                            type="datetime-local" 
                                            name="end_time" 
                                            id="end_time" 
                                            value={updatedEnd_time} 
                                                onChange={(e) => setUpdatedEnd(e.target.value)} 
                                        />
                                    </label>
                                    <label htmlFor="location">
                                        Location:
                                        <input type="text" name="location" id="location" value={updatedLocation}                                  
                                        onChange={(e) => setUpdatedLocation(e.target.value)}/>
                                    </label>
                                    <label htmlFor="backgroundColor">
                                        Color:
                                        <input type="color" name="eventcolor" id="eventcolor" value={updatedEventcolor}
                                        onChange={(e) => setUpdatedEventcolor(e.target.value)}
                                        />
                                    </label>

                                    <label htmlFor="recurring">
                                        Recurring:
                                        <input type="checkbox" name="recurring" id="recurring" checked={updatedRecurring}
                                         onChange={(e) => {
                                            setUpdatedRecurring(e.target.checked); // Call setUpdatedRecurring with the checked value
                                            handleRecurringCheckboxChange(e); // Call handleRecurringCheckboxChange function
                                        }}
                                        />
                                    </label>
                                    {showRecurringFields && (
                                        <>
                                            <label htmlFor="freq">
                                                Frequency:
                                                <select name="freq" id="freq" value={updatedRruleFreq} 
                                                onChange={(e) => setUpdatedRruleFreq(e.target.value)}>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="yearly">Yearly</option>
                                                </select>
                                            </label>
                                            <label htmlFor="until">
                                                Until:
                                                <input 
                                                    type="datetime-local" 
                                                    name="until" 
                                                    id="until" 
                                                    value={updatedRruleUntil} 
                                                        onChange={(e) => setUpdatedRruleUntil(e.target.value)}
                                                />
                                            </label>
                                            <label htmlFor="dtstart">
                                                Start Date:
                                                <input 
                                                    type="datetime-local" 
                                                    name="dtstart" 
                                                    id="dtstart" 
                                                    value={updatedRruleDtstart}
                                                        onChange={(e) => setUpdatedRruleDtstart(e.target.value)}
                                                />
                                            </label>
                                        </>
                                    )}
                                    <Button type="submit" onClick={() => handleUpdateEvent(selectedEvent.event_id)}>Update</Button>
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