import {
    createBrowserRouter,
    createRoutesFromElements,
    Route
} from 'react-router-dom';
import App from './App';
import Landing from './pages/Calendar';
import Event from './pages/Event'; // Import the Event component
import { calendarsLoader, calendarLoader, eventLoader } from './loaders';
import { createAction, deleteAction, updateAction } from "./actions";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/' element={<App />}>
            <Route path='' element={<Landing />} loader={calendarsLoader} />
            {/* Define route for the event show page */}
            <Route path='/calendar/:calendar_id/event/:event_id' element={<Event />} loader={eventLoader} />
            <Route path='create' action={createAction} />
            <Route path='update/:event_id' action={updateAction} />
            <Route path='/calendar/:calendar_id/event/delete/:event_id' action={deleteAction} />
        </Route>
    )
);

export default router;