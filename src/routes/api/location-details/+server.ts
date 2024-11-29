import { json } from '@sveltejs/kit';
import { retrieveMapboxPlace } from '$lib/server/mapbox_services';

export async function GET({ url }) {
    const id = url.searchParams.get('id');
    
    if (!id) {
        return json({ error: 'ID parameter is required' }, { status: 400 });
    }

    const placeDetails = await retrieveMapboxPlace(id);
    return json(placeDetails);
}
