// lib/services/mapbox.ts
const MAPBOX_TOKEN = "pk.eyJ1Ijoid29qbWF0NCIsImEiOiJjbHFibDl2MzUyYXFoMnNwMTBnN29wbWpiIn0.rkMEPGAVf_Tav0eeDIisQA";
let SESSION_TOKEN: string | null = null;

function getOrCreateSessionToken() {
    if (!SESSION_TOKEN) {
        SESSION_TOKEN = crypto.randomUUID();
    }
    return SESSION_TOKEN;
}

export async function getMapboxSuggestions(query: string) {
    const sessionToken = getOrCreateSessionToken();
    const url = new URL("https://api.mapbox.com/search/searchbox/v1/suggest");
    url.searchParams.append("q", query);
    url.searchParams.append("language", "en");
    url.searchParams.append("types", "place, city");
    url.searchParams.append("access_token", MAPBOX_TOKEN);
    url.searchParams.append("session_token", sessionToken);


    const response = await fetch(url);
    return response.json();
}

export async function retrieveMapboxPlace(placeId: string) {
    const sessionToken = getOrCreateSessionToken();
    const url = new URL(`https://api.mapbox.com/search/searchbox/v1/retrieve/${placeId}`);
    url.searchParams.append("access_token", MAPBOX_TOKEN);
    url.searchParams.append("session_token", sessionToken);
    url.searchParams.append("language", "en");

    const response = await fetch(url);
    return response.json();
}
