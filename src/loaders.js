
const URL = process.env.REACT_APP_URL;

export const calendarsLoader = async () => {
    const response = await fetch(`${URL}/calendar`);
    const calendars = await response.json();
    return calendars;
}

export const calendarLoader = async ({params}) => {
    const response = await fetch(`${URL}/calendar/${params.id}`);
    const calendar = await response.json();
    return calendar;
}

export const eventLoader = async(params) => {
    const { calendar_id, event_id } = params
    const response = await fetch(`${URL}/calendar/${calendar_id}/event/${event_id}`)
    const event = await response.json();
    return event;
}


