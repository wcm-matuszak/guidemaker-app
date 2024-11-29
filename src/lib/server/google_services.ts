import { GOOGLE_PLACES_API_KEY } from '$env/static/private';

const PLACES_FIELD_MASK = [
    'places.displayName',
    'places.rating',
    'places.userRatingCount',
    'places.photos.name',
    'places.editorialSummary',
    'places.types',
    'places.googleMapsUri',
    'places.formattedAddress',
    'places.location',
    'places.primaryTypeDisplayName',
    'places.reviews.rating',
    'places.reviews.text',
    'places.priceLevel',
    'places.websiteUri',
    'places.regularOpeningHours.weekdayDescriptions'
].join(',');

interface GooglePlacesResponse {
    places: Array<{
        displayName: {
            text: string;
            languageCode: string;
        };
        formattedAddress?: string;
        types?: string[];
        rating?: number;
    }>;
    nextPageToken?: string;
}

interface SearchOptions {
    pageSize?: number;         // Controls number of results per page (1-20)
    pageToken?: string;        // Token for fetching next page of results
    locationBias?: {           // Biases results to a specific geographic area
        circle: {
            center: {
                latitude: number;
                longitude: number;
            };
            radius: number;    // Radius in meters (0-50000)
        };
    };
    openNow?: boolean;        // Filter for places currently open
    minRating?: number;       // Filter by minimum rating (0-5 in 0.5 increments)
}


export async function searchPlaces(query: string, options: SearchOptions = {}) {
    const url = 'https://places.googleapis.com/v1/places:searchText';
    
    const requestBody = {
        textQuery: query,
        ...options
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': PLACES_FIELD_MASK
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error('Failed to fetch places data');
    }

    return await response.json();
}
