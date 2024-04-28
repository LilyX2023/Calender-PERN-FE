// Landing.js
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from '@fullcalendar/rrule';
import { useLoaderData } from "react-router-dom";




const Landing = () => {
    const calendars = useLoaderData();
    const [selectedCalendar, setSelectedCalendar] = useState(null);
    const [events, setEvents] = useState([]);
    const URL = process.env.REACT_APP_URL;


    const handleCalendarChange = (calendarId) => {
        setSelectedCalendar(calendarId);
    };

    //Use useEffect to get data from seleted calendar
    useEffect(() => {
        if (selectedCalendar) {
            fetchEvents(selectedCalendar);
        }
    }, [selectedCalendar]);

    const fetchEvents = async (calendarId) => {
        try {
            const response = await fetch(`${URL}/calendar/${calendarId}/event`);
            const eventsData = await response.json();
    
            console.log("Events Data from Backend:", eventsData); // Log the data received from the backend
            const formattedEvents = eventsData.map(event => {
                const formattedEvent = {
                    title: event.title,
                    description: event.description,
                    start: new Date(event.start_time), // Format start time
                    end: new Date(event.end_time), // Format end time
                    location: event.location,
                    color: event.color,
                    recurring: event.recurring,
                };
    
                if (event.recurring) {
                    formattedEvent.rrule = event.rrule;
                }
    
                return formattedEvent;
            });
    
            console.log("Formatted Events:", formattedEvents); // Log the formatted events
            setEvents(formattedEvents);
            console.log(formattedEvents)
        } catch (error) {
            console.error('Error fetching events:', error);
        }
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
                />
            )}
        </div>
    );
};

export default Landing;