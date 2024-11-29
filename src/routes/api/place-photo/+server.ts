import { json } from '@sveltejs/kit';
import { GOOGLE_PLACES_API_KEY } from '$env/static/private';

export async function GET({ url }) {
    const photoName = url.searchParams.get('photoName');
    
    if (!photoName) {
        return redirectToPlaceholder();
    }

    const googlePhotoUrl = new URL(`https://places.googleapis.com/v1/${photoName}/media`);
    googlePhotoUrl.searchParams.append('key', GOOGLE_PLACES_API_KEY);
    googlePhotoUrl.searchParams.append('maxHeightPx', '400');
    googlePhotoUrl.searchParams.append('maxWidthPx', '400');
    googlePhotoUrl.searchParams.append('skipHttpRedirect', 'true');

    try {
        const response = await fetch(googlePhotoUrl.toString(), {
            headers: {
                'X-Goog-FieldMask': '*'
            }
        });

        if (!response.ok) {
            console.log('Google Photos API error response:', response.status, response.statusText);
            return redirectToPlaceholder();
        }

        const data = await response.json();
        //console.log('Google Photos API response:', data);

        return new Response(null, {
            status: 302,
            headers: {
                Location: data.photoUri
            }
        });
    } catch (error) {
        console.log('Google Photos API error:', error);
        return redirectToPlaceholder();
    }
}

function redirectToPlaceholder() {
    return new Response(null, {
        status: 302,
        headers: {
            Location: `https://placehold.co/400x400/EEE/31343C?text=No+Image`
        }
    });
}
