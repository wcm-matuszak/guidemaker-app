import { json } from '@sveltejs/kit';
import { searchPlaces } from '$lib/server/google_services';

export async function GET({ url }) {
    const latitude = parseFloat(url.searchParams.get('latitude') || '');
    const longitude = parseFloat(url.searchParams.get('longitude') || '');
    const city = url.searchParams.get('city');
    const query = url.searchParams.get('query') || 'Top sights ';
    
    let searchOptions = {};

    if (!isNaN(latitude) && !isNaN(longitude)) {
        searchOptions = {
            pageSize: 20,
            locationBias: {
                circle: {
                    center: { latitude, longitude },
                    radius: 10000 //10km radius
                }
            }
        };
    }

    const searchQuery = city ? `${query} in ${city}` : query;
    const results = await searchPlaces(searchQuery, searchOptions);
    return json(results);
}
