import { redirect } from "react-router-dom";

const URL = process.env.REACT_APP_URL;

//update action
export const updateAction = async ({ request, params }) => {
    const formData = await request.formData() //the request object has data for forms. We can access it.
    const { calendar_id, event_id } = params; // Extract calendar_id and params.event_id
    const updatedEvent = {
        title: formData.get('title'), 
        description: formData.get('description'), 
        start: formData.get('start_time'), 
        end: formData.get('end_time'),
        location: formData.get('location'),
        color: formData.get('color'),
        recurring: formData.get("recurring"),
        rrule: formData.get("rrule")
    }
    console.log(updatedEvent)

    await fetch(`${URL}/calendar/${calendar_id}/event/${event_id}`, 
    {
        method: 'put',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProject)
    })

    return redirect('/') //go back to the landing page 
}


//Create action
export const createAction = async ({ request }) => {
    const formData = await request.formData() //the request object has data for forms. We can access it. 
    const { calendar_id } = params;
    const createdEvent = {
        title: formData.get('title'), 
        description: formData.get('description'), 
        start: formData.get('start_time'), 
        end: formData.get('end_time'),
        location: formData.get('location'),
        color: formData.get('color'),
        recurring: formData.get("recurring"),
        rrule: formData.get("rrule")
    }

    await fetch(`${URL}/calendar/${calendar_id}/event`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(createdEvent)
    })

    return redirect('/')
}


//Delete action
export const deleteAction = async ({params}) => {
    // Extracting projectId and taskId from the request parameters
    const { calendar_id, event_id } = params

    await fetch(`${URL}/calendar/${calendar_id}/event/${event_id}`, {
        method: 'delete'
    });

    return redirect(`/`)
}