// EventForm.js
import React, { useState } from 'react';

const EventForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start_time, setStart] = useState('');
  const [end_time, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [color, setColor] = useState('#000000'); // Default color
  const [recurring, setRecurring] = useState(false);
  const [rruleFreq, setRruleFreq] = useState('weekly');
  const [rruleUntil, setRruleUntil] = useState('');
  const [rruleDtstart, setRruleDtstart] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const rrule = recurring
      ? {
          freq: rruleFreq,
          until: rruleUntil,
          dtstart: rruleDtstart,
        }
      : null;
    onSubmit({
      title,
      description,
      start_time,
      end_time,
      location,
      color,
      recurring,
      rrule
    });
    // Reset form fields after submission
    setTitle('');
    setDescription('');
    setStart('');
    setEnd('');
    setLocation('');
    setColor('#000000'); // Reset color to default
    setRecurring(false);
    setRruleFreq('weekly');
    setRruleUntil('');
    setRruleDtstart('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Title:
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        Description:
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label>
        Start:
        <input type="datetime-local" value={start_time} onChange={(e) => setStart(e.target.value)} />
      </label>
      <label>
        End:
        <input type="datetime-local" value={end_time} onChange={(e) => setEnd(e.target.value)} />
      </label>
      <label>
        Location:
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
      </label>
      <label>
        Color:
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      </label>
      <label>
        Recurring:
        <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
      </label>
      {recurring && (
        <>
          <label>
            Frequency:
            <select value={rruleFreq} onChange={(e) => setRruleFreq(e.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>
          <label>
            Until:
            <input type="datetime-local" value={rruleUntil} onChange={(e) => setRruleUntil(e.target.value)} />
          </label>
          <label>
            Start Date:
            <input type="datetime-local" value={rruleDtstart} onChange={(e) => setRruleDtstart(e.target.value)} />
          </label>
          
        </>
      )}
      <button type="submit">Add Event</button>
    </form>
  );
};

export default EventForm;
