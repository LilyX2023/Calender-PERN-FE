import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { DialogContent, DialogActions, Button } from '@mui/material';

const EditEventForm = ({ event, onUpdate, onClose }) => {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [start_time, setStart] = useState(event.start_time);
  const [end_time, setEnd] = useState(event.end_time);
  const [location, setLocation] = useState(event.location);
  const [eventColor, setEventColor] = useState(event.eventColor);
  const [recurring, setRecurring] = useState(event.recurring);
  const [rruleFreq, setRruleFreq] = useState(event.rrule ? event.rrule.freq : 'weekly');
  const [rruleUntil, setRruleUntil] = useState(event.rrule ? event.rrule.until : '');
  const [rruleDtstart, setRruleDtstart] = useState(event.rrule ? event.rrule.dtstart : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const rrule = recurring
      ? {
          freq: rruleFreq,
          until: rruleUntil,
          dtstart: rruleDtstart,
        }
      : null;

    onUpdate({
      title,
      description,
      start_time,
      end_time,
      location,
      eventColor,
      recurring,
      rrule
    });

    // Close the dialog after submission
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>Edit Event</DialogTitle>
      <DialogContent>
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
            <input type="color" value={eventColor} onChange={(e) => setEventColor(e.target.value)} />
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
          <Button type="submit" color="primary">Save Changes</Button>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEventForm;
