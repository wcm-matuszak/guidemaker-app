<script lang="ts">
    import { onMount } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import * as Card from '$lib/components/ui/card';
    import * as Alert from '$lib/components/ui/alert';
    import { Search, MapPin } from 'lucide-svelte';

    let searchValue = '';
    let suggestions: any[] = [];
    let loading = false;
    let error = '';
    let POIResults: any[] = [];
    let mounted = false;
    let generatedGuide: string | null = null;
    let isLoading = false;
    let hasAllData = false;

    async function handleMapboxSearch(query: string) {
        if (query.length < 3) {
            suggestions = [];
            return;
        }

        try {
            const response = await fetch(`/api/search-location?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            suggestions = data.suggestions;
        } catch (e) {
            error = e.message;
        }
    }

    async function handleMapboxSelect(mapboxId: string) {
        try {
            const response = await fetch(`/api/location-details?id=${mapboxId}`);
            const data = await response.json();

            const coordinates = data.features[0].properties.coordinates;
            const cityName = data.features[0].properties.name;
            const full_address = data.features[0].properties.full_address;
            getPOIs(coordinates.latitude, coordinates.longitude, cityName, full_address);
            suggestions = [];
            searchValue = '';
        } catch (e) {
            error = e.message;
        }
    }

    async function generateGuide(places: any[], cityName: string, full_address: string) {
        try {
            const response = await fetch('/api/generate-guide', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ places, cityName, full_address })
            });

            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error || 'Failed to generate guide');
            
            return data.itinerary;
        } catch (e) {
            error = e.message;
            console.error('Guide generation error:', error);
            return null;
        }
    }

    async function getPOIs(latitude: number, longitude: number, cityName: string, full_address: string) {
        isLoading = true;
        hasAllData = false;
        
        const params = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            city: cityName
        });
        
        try {
            const response = await fetch(`/api/points-of-interest?${params}`);
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message || 'Failed to get POIs');
            
            POIResults = data.places || [];
            
            const guide = await generateGuide(POIResults, cityName, full_address);
            if (guide) {
                generatedGuide = guide;
                hasAllData = true;
            }
        } catch (e) {
            error = e.message;
            POIResults = [];
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        mounted = true;
    });
</script>



{#if mounted}
    
    <div class="min-h-screen bg-gradient-to-b from-background to-muted/50 flex flex-col">
        <!-- Hero Section -->
        <div class="relative overflow-hidden pb-2 pt-20">
            <div class="container relative">
                <div class="flex flex-col items-center text-center">
                    <div class="flex items-center space-x-2 rounded-full border bg-background/95 px-4 py-1.5 text-sm mb-8">
                        <span class="text-primary">✨ Your Personal Travel Guide</span>
                    </div>
                    
                    <h1 class="font-bold text-4xl sm:text-5xl md:text-6xl mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        City Guide Maker
                    </h1>
                    
                    <p class="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 mb-12">
                        Transform any city into a personalized travel experience with AI-powered itineraries, curated attractions, and local insights.
                    </p>

                    
                
                </div>
            </div>
        </div>
    
    <main class="container mx-auto p-4 max-w-3xl space-y-6 flex-1">
        

        <!-- Search Card -->
        <Card.Root>
            <div class="p-6">
                <div class="relative z-[1001] mx-auto max-w-md">
                    <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        class="pl-10 focus-visible:ring-0"
                        placeholder="Search locations..."
                        bind:value={searchValue}
                        on:input={() => handleMapboxSearch(searchValue)}
                    />
                    {#if suggestions.length > 0 && searchValue.length > 2}
                        <div class="absolute mt-1 w-full rounded-md border bg-background shadow-lg">
                            {#each suggestions as suggestion}
                                <button
                                    type="button"
                                    class="w-full cursor-pointer px-4 py-2 hover:bg-muted text-left"
                                    on:click={() => handleMapboxSelect(suggestion.mapbox_id)}
                                    on:keydown={(e) => e.key === 'Enter' && handleMapboxSelect(suggestion.mapbox_id)}
                                >
                                    <div class="flex items-center">
                                        <MapPin class="mr-2 h-4 w-4" />
                                        <div class="text-left">
                                            <p class="font-medium">{suggestion.name}</p>
                                            <p class="text-sm text-muted-foreground">{suggestion.place_formatted}</p>
                                        </div>
                                    </div>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </Card.Root>

        {#if error}
            <Alert.Root variant="destructive">
                <Alert.Title>Error</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
        {/if}

        {#if isLoading}
            <Card.Root>
                <Card.Header>
                    <Card.Title>Loading your travel guide...</Card.Title>
                    <div class="space-y-3 py-6">
                        <div class="h-4 bg-muted rounded animate-pulse"></div>
                        <div class="h-4 bg-muted rounded animate-pulse"></div>
                        <div class="h-4 w-4/5 bg-muted rounded animate-pulse"></div>
                    </div>
                </Card.Header>
            </Card.Root>
        {:else if hasAllData}
            <Card.Root>
                <Card.Header>
                    <Card.Title>Your Travel Guide</Card.Title>
                </Card.Header>
                <Card.Content>
                    <div class="prose prose-sm max-w-none">
                        {@html generatedGuide}
                    </div>
                </Card.Content>
            </Card.Root>

            <div>
                <h2 class="text-xl font-semibold mb-4">Points of Interest</h2>
                <div class="grid gap-4 md:grid-cols-2">
                    {#each POIResults as place}
                        <Card.Root class="overflow-hidden flex flex-col h-full">
                            {#if place.photos && place.photos[0]}
                                <img
                                    src={`/api/place-photo?photoName=${encodeURIComponent(place.photos[0].name)}`}
                                    alt={place.displayName?.text || 'Place photo'}
                                    class="w-full h-48 object-cover"
                                />
                            {/if}
                            <Card.Header>
                                <Card.Title class="truncate">
                                    {place.displayName?.text || 'Unnamed Location'}
                                </Card.Title>
                                {#if place.editorialSummary}
                                    <Card.Description>
                                        {place.editorialSummary.text}
                                    </Card.Description>
                                {/if}
                            </Card.Header>
                            <Card.Footer class="flex justify-between items-center p-4 mt-auto">
                                {#if place.rating}
                                    <div class="flex items-center gap-1">
                                        <span class="text-yellow-500">★</span>
                                        <span>{place.rating}</span>
                                        {#if place.userRatingCount}
                                            <span class="text-sm text-muted-foreground">
                                                ({place.userRatingCount})
                                            </span>
                                        {/if}
                                    </div>
                                {/if}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    href={place.googleMapsUri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View on Maps
                                </Button>
                            </Card.Footer>
                        </Card.Root>
                    {/each}
                </div>
            </div>
        {/if}

        
    </main>
    <footer class="mt-12 border-t">
        <div class="container mx-auto p-4 text-sm text-muted-foreground">
            <div class="flex flex-col justify-center items-center gap-4 text-center">
                <p>© 2024 Wojciech Matuszak</p>
                <div class="flex gap-4">
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" class="hover:text-foreground">Terms of Use</a>
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" class="hover:text-foreground">Privacy Policy</a>
                </div>
            </div>
        </div>
    </footer>
</div>
{/if}

