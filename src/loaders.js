
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
