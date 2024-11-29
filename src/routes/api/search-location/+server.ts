import { json } from '@sveltejs/kit';
import { getMapboxSuggestions } from '$lib/server/mapbox_services';

export async function GET({ url }) {
    const query = url.searchParams.get('query');
    
    if (!query) {
        return json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const suggestions = await getMapboxSuggestions(query);
    return json(suggestions);
}
