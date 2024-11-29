import { json } from '@sveltejs/kit';
import { generateItinerary } from '$lib/server/gemini_services';

export async function POST({ request }) {
    try {
        const { places, cityName, full_address } = await request.json();
        
        if (!places || !Array.isArray(places) || places.length === 0) {
            return json({ error: 'Places array is required and must not be empty' }, { status: 400 });
        }

        const itinerary = await generateItinerary(
            places, 
            cityName,
            full_address 
        );
        
        return json({ itinerary });

    } catch (error) {
        console.error('Itinerary generation error:', error);
        return json({ 
            error: 'Failed to generate itinerary',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
