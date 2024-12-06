<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import * as Carousel from '$lib/components/ui/carousel';
	import {
		Search,
		MapPin,
		RemoveFormatting,
		List,
		ListOrdered,
		ImagePlus,
		Highlighter,
		Code,
		Video,
		Undo,
		Redo,
		PinOff,
		Pin
	} from 'lucide-svelte';

	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import ImageExtension from '@tiptap/extension-image';
	import Highlight from '@tiptap/extension-highlight';
	import Iframe from '$lib/extensions/iframe';
	import { ImageGroup } from '$lib/extensions/imagegroup';

	let element: HTMLElement;
	let editor: Editor | null = null;

	onMount(() => {
		mounted = true;
	});

	$: if (hasAllData && element && generatedGuide && !editor) {
		editor = new Editor({
			element: element as HTMLElement,
			extensions: [
				StarterKit,
				Link,
				ImageExtension.configure({ inline: true }),
				Highlight,
				ImageGroup,
				Iframe.configure({
					allowFullscreen: true,
					HTMLAttributes: {
						class: 'w-full aspect-video rounded-lg'
					}
				})
			],
			editorProps: {
				attributes: {
					class:
						'prose prose-sm sm:prose-base m-5 focus:outline-none whitespace-pre-wrap [&_a]:cursor-pointer'
				}
			},
			content: `${generatedGuide}`,
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
			},
			autofocus: true,
			editable: isEditing, 
			injectCSS: false
		});
	}

	let searchValue = '';
	let suggestions: any[] = [];
	let error = '';
	let SightsResults: any[] = [];
	let RestaurantResults: any[] = [];
	let mounted = false;
	let generatedGuide: string | null = null;
	let isLoading = false;
	let hasAllData = false;
	let pinnedPlaces: any[] = [];
	let isEditing = false;

function toggleEdit() {
    isEditing = !isEditing;
    editor?.setEditable(isEditing);
}

	$: pinnedStatus = new Set(pinnedPlaces.map((p) => p.googleMapsUri));

	function togglePin(place: any) {
		if (isPinned(place)) {
			pinnedPlaces = pinnedPlaces.filter((p) => p.googleMapsUri !== place.googleMapsUri);
		} else {
			pinnedPlaces = [...pinnedPlaces, place];
		}
	}
	function isPinned(place: any) {
		return pinnedStatus.has(place.googleMapsUri);
	}

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
			error = ''; // Reset error on successful selection
			getPOIs(coordinates.latitude, coordinates.longitude, cityName, full_address);
			suggestions = [];
			searchValue = '';
		} catch (e) {
			error = e.message;
		}
	}

	async function generateGuide(
		places: any[],
		restaurants: any[],
		cityName: string,
		full_address: string
	) {
		try {
			const response = await fetch('/api/generate-guide', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ places, restaurants, cityName, full_address })
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

	// Cleanup editor when generating new guide
	function cleanupEditor() {
		if (editor) {
			editor.destroy();
			editor = null;
		}
	}

	async function getPOIs(
		latitude: number,
		longitude: number,
		cityName: string,
		full_address: string
	) {
		cleanupEditor();
		isLoading = true;
		hasAllData = false;

		try {
			// First fetch sights
			const sightsResponse = await fetch(
				`/api/points-of-interest?${new URLSearchParams({
					latitude: latitude.toString(),
					longitude: longitude.toString(),
					city: cityName,
					query: `Top sights in ${cityName}`
				})}`
			);
			const sightsData = await sightsResponse.json();
			SightsResults = sightsData.places || [];
			console.log('Sights fetched:', SightsResults.length, 'results');

			// Then fetch restaurants
			const restaurantResponse = await fetch(
				`/api/points-of-interest?${new URLSearchParams({
					latitude: latitude.toString(),
					longitude: longitude.toString(),
					city: cityName,
					query: `Local food restaurants in ${cityName}`
				})}`
			);
			const restaurantData = await restaurantResponse.json();
			RestaurantResults = restaurantData.places || [];
			console.log('Restaurants fetched:', RestaurantResults.length, 'results');

			// Generate guide only after both fetches complete successfully
			console.log(
				'Generating guide with:',
				SightsResults.length,
				'sights and',
				RestaurantResults.length,
				'restaurants'
			);
			const guide = await generateGuide(SightsResults, RestaurantResults, cityName, full_address);
			if (guide) {
				generatedGuide = guide;
				hasAllData = true;
			}
		} catch (e) {
			error = e.message;
			SightsResults = [];
			RestaurantResults = [];
			console.error('Error in getPOIs:', e);
		} finally {
			isLoading = false;
		}
	}
</script>

{#if mounted}
	<div class="flex min-h-screen flex-col bg-gradient-to-b from-white to-[#FDF6E3]/50">
		<!-- Hero Section -->
		<div class="relative overflow-hidden pb-2 pt-20">
			<div class="container relative">
				<div class="flex flex-col items-center text-center">
					<div
						class="bg-background/95 mb-8 flex items-center space-x-2 rounded-full border px-4 py-1.5 text-sm"
					>
						<span class="text-primary">✨ Your Personal Travel Guide</span>
					</div>

					<h1
						class="from-foreground to-foreground/70 mb-6 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent sm:text-5xl md:text-6xl"
					>
						City Guide Maker
					</h1>

					<p
						class="text-muted-foreground mb-12 max-w-[42rem] leading-normal sm:text-xl sm:leading-8"
					>
						Transform any city into a personalized travel experience with AI-powered itineraries,
						curated attractions, and local insights.
					</p>
				</div>
			</div>
		</div>

		<main class="container mx-auto max-w-3xl flex-1 space-y-6 p-4">
			<!-- Search Card -->
			<Card.Root>
				<div class="p-6">
					<div class="relative z-[1001] mx-auto max-w-md">
						<Search
							class="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
						/>
						<Input
							class="pl-10 focus-visible:ring-0"
							placeholder="Search locations..."
							bind:value={searchValue}
							on:input={() => handleMapboxSearch(searchValue)}
						/>
						{#if suggestions.length > 0 && searchValue.length > 2}
							<div class="bg-background absolute mt-1 w-full rounded-md border shadow-lg">
								{#each suggestions as suggestion}
									<button
										type="button"
										class="hover:bg-muted w-full cursor-pointer px-4 py-2 text-left"
										on:click={() => handleMapboxSelect(suggestion.mapbox_id)}
										on:keydown={(e) =>
											e.key === 'Enter' && handleMapboxSelect(suggestion.mapbox_id)}
									>
										<div class="flex items-center">
											<MapPin class="mr-2 h-4 w-4 flex-shrink-0" />
											<div class="text-left">
												<p class="font-medium">{suggestion.name}</p>
												<p class="text-muted-foreground text-sm">{suggestion.place_formatted}</p>
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
							<div class="bg-muted h-4 animate-pulse rounded"></div>
							<div class="bg-muted h-4 animate-pulse rounded"></div>
							<div class="bg-muted h-4 w-4/5 animate-pulse rounded"></div>
						</div>
					</Card.Header>
				</Card.Root>
			{:else if hasAllData}
				<!-- Itinerary Editor -->
				<Card.Root>					
					<Card.Content>
						{#if editor}
							<div
								id="editor-menu"
								class="bg-background sticky top-0 z-10 flex flex-wrap gap-2 border-b p-2"
							>
								
						
								{#if isEditing}
								<!-- Bold -->
								<button
									class="hover:bg-muted h-8 w-8 rounded border transition-colors"
									class:active={editor?.isActive('bold')}
									on:click={() => editor?.chain().focus().toggleBold().run()}
								>
									<strong>B</strong>
								</button>

								<!-- Italic -->
								<button
									class="hover:bg-muted h-8 w-8 rounded border transition-colors"
									class:active={editor?.isActive('italic')}
									on:click={() => editor?.chain().focus().toggleItalic().run()}
								>
									<em>I</em>
								</button>

								<!-- Strikethrough -->
								<button
									class="hover:bg-muted h-8 w-8 rounded border transition-colors"
									class:active={editor?.isActive('strike')}
									on:click={() => editor?.chain().focus().toggleStrike().run()}
								>
									<span class="line-through">S</span>
								</button>

								<!-- Heading 1 -->
								<button
									class="hover:bg-muted h-8 w-8 rounded border transition-colors"
									class:active={editor?.isActive('heading', { level: 1 })}
									on:click={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
								>
									H1
								</button>

								<!-- Heading 2 -->
								<button
									class="hover:bg-muted h-8 w-8 rounded border transition-colors"
									class:active={editor?.isActive('heading', { level: 2 })}
									on:click={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
								>
									H2
								</button>

								<!-- Bullet List -->
								<button
									class="hover:bg-muted flex h-8 w-8 items-center justify-center rounded border transition-colors"
									class:active={editor?.isActive('bulletList')}
									on:click={() => editor?.chain().focus().toggleBulletList().run()}
								>
									<List class="h-4 w-4" />
								</button>

								<!-- Ordered List -->
								<button
									class="hover:bg-muted flex h-8 w-8 items-center justify-center rounded border transition-colors"
									class:active={editor?.isActive('orderedList')}
									on:click={() => editor?.chain().focus().toggleOrderedList().run()}
								>
									<ListOrdered class="h-4 w-4" />
								</button>

								<!-- Blockquote -->
								<button
									class="hover:bg-muted h-8 w-8 rounded border transition-colors"
									class:active={editor?.isActive('blockquote')}
									on:click={() => editor?.chain().focus().toggleBlockquote().run()}
								>
									" "
								</button>

								<!-- Horizontal Rule -->
								<button
									class="hover:bg-muted h-8 w-8 rounded border transition-colors"
									on:click={() => editor?.chain().focus().setHorizontalRule().run()}
								>
									―
								</button>

								<!-- Image Insert -->
								<button
									class="hover:bg-muted flex h-8 w-8 items-center justify-center rounded border transition-colors"
									on:click={() => {
										const url = window.prompt('Enter image URL:');
										if (url) {
											editor?.chain().focus().setImage({ src: url }).run();
										}
									}}
								>
									<ImagePlus class="h-4 w-4" />
								</button>

								<!-- Iframe -->
								<button
									class="hover:bg-muted flex h-8 w-8 items-center justify-center rounded border transition-colors"
									on:click={() => {
										const url = window.prompt('Enter youtube or tiktok URL');
										if (url) {
											editor?.chain().focus().setIframe({ src: url }).run();
										}
									}}
								>
									<Video class="h-4 w-4" />
								</button>

								<!-- Highlight -->
								<button
									class="hover:bg-muted flex h-8 w-8 items-center justify-center rounded border transition-colors"
									class:active={editor?.isActive('highlight')}
									on:click={() => editor?.chain().focus().toggleHighlight().run()}
								>
									<Highlighter class="h-4 w-4" />
								</button>

								<!-- Code 
								<button
									class="hover:bg-muted flex h-8 w-8 items-center justify-center rounded border transition-colors"
									class:active={editor?.isActive('code')}
									on:click={() => editor?.chain().focus().toggleCode().run()}
								>
									<Code class="h-4 w-4" />
								</button>-->

								<!-- Clear Format -->
								<button
									class="hover:bg-muted flex h-8 w-8 items-center justify-center rounded border transition-colors"
									on:click={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}
								>
									<RemoveFormatting class="h-4 w-4" />
								</button>

								<div class="flex gap-2">
									<!-- Undo -->
									<button
										class="hover:bg-muted flex h-8 w-8 items-center justify-center rounded border transition-colors"
										on:click={() => editor?.chain().focus().undo().run()}
										disabled={!editor?.can().undo()}
									>
										<Undo class="h-4 w-4" />
									</button>

									<!-- Redo -->
									<button
										class="hover:bg-muted flex h-8 w-8 items-center justify-center rounded border transition-colors"
										on:click={() => editor?.chain().focus().redo().run()}
										disabled={!editor?.can().redo()}
									>
										<Redo class="h-4 w-4" />
									</button>
								</div>
								{/if}
								{#if !isEditing}
								<Card.Title class="my-auto" >Your Travel Guide</Card.Title>
								{/if}
								<Button 
									variant="outline"
									size="sm"
									class="ml-auto"
									on:click={toggleEdit}
								>
									{isEditing ? 'Preview' : 'Edit'}
								</Button>
							</div>
						{/if}
						<div class="element relative" bind:this={element}></div>
					</Card.Content>
				</Card.Root>

				<!-- Carousel of Sights -->
				<div>
					<h2 class="mb-0 ml-6 text-xl font-semibold">Popular Sights</h2>
					<Carousel.Root opts={{ align: 'start' }} class="mx-auto max-w-[85vw] scale-90">
						<Carousel.Content class="max-w-[760px]">
							{#each SightsResults as place}
								<Carousel.Item class="max-w-[360px]">
									<Card.Root class="relative flex h-full max-w-[360px] flex-col overflow-hidden">
										<Button
											variant="ghost"
											size="icon"
											class={`absolute right-2 top-2 z-10 backdrop-blur-sm ${
												pinnedPlaces.some((p) => p.googleMapsUri === place.googleMapsUri)
													? 'bg-white/80'
													: 'bg-white/50'
											}`}
											on:click={() => togglePin(place)}
										>
											{#if pinnedPlaces.some((p) => p.googleMapsUri === place.googleMapsUri)}
												<Pin fill="black" class="h-4 w-4" />
											{:else}
												<Pin class="h-4 w-4" />
											{/if}
										</Button>
										{#if place.photos && place.photos[0]}
											<img
												src={`/api/place-photo?photoName=${encodeURIComponent(place.photos[0].name)}`}
												alt={place.displayName?.text || 'Place photo'}
												class="h-48 w-full object-cover"
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
										<Card.Footer class="mt-auto flex items-center justify-between p-4">
											<div class="flex items-center gap-2">
												{#if place.rating}
													<div class="flex items-center gap-1">
														<span class="text-yellow-500">★</span>
														<span>{place.rating}</span>
														{#if place.userRatingCount}
															<span class="text-muted-foreground text-sm"
																>({place.userRatingCount})</span
															>
														{/if}
													</div>
												{/if}
											</div>
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
								</Carousel.Item>
							{/each}
						</Carousel.Content>
						<Carousel.Previous />
						<Carousel.Next />
					</Carousel.Root>
				</div>

				<!-- Carousel of Restaurants -->
				<div>
					<h2 class="mb-0 ml-6 text-xl font-semibold">Local Restaurants</h2>
					<Carousel.Root opts={{ align: 'start' }} class="mx-auto max-w-[85vw] scale-90">
						<Carousel.Content class="max-w-[760px]">
							{#each RestaurantResults as place}
								<Carousel.Item class="max-w-[360px]">
									<Card.Root class="relative flex h-full max-w-[360px] flex-col overflow-hidden">
										<Button
											variant="ghost"
											size="icon"
											class={`absolute right-2 top-2 z-10 backdrop-blur-sm ${
												pinnedPlaces.some((p) => p.googleMapsUri === place.googleMapsUri)
													? 'bg-white/80'
													: 'bg-white/50'
											}`}
											on:click={() => togglePin(place)}
										>
											{#if pinnedPlaces.some((p) => p.googleMapsUri === place.googleMapsUri)}
												<Pin fill="black" class="h-4 w-4" />
											{:else}
												<Pin class="h-4 w-4" />
											{/if}
										</Button>
										{#if place.photos && place.photos[0]}
											<img
												src={`/api/place-photo?photoName=${encodeURIComponent(place.photos[0].name)}`}
												alt={place.displayName?.text || 'Place photo'}
												class="h-48 w-full object-cover"
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
										<Card.Footer class="mt-auto flex items-center justify-between p-4">
											<div class="flex items-center gap-2">
												{#if place.rating}
													<div class="flex items-center gap-1">
														<span class="text-yellow-500">★</span>
														<span>{place.rating}</span>
														{#if place.userRatingCount}
															<span class="text-muted-foreground text-sm"
																>({place.userRatingCount})</span
															>
														{/if}
													</div>
												{/if}
											</div>
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
								</Carousel.Item>
							{/each}
						</Carousel.Content>
						<Carousel.Previous />
						<Carousel.Next />
					</Carousel.Root>
				</div>

				<!-- Popular Sights Cards
				<div>
					<h2 class="mb-4 text-xl font-semibold">Popular Sights</h2>
					<div class="grid gap-4 sm:grid-cols-2">
						{#each SightsResults as place}
							<Card.Root class="relative flex h-full flex-col overflow-hidden">
								<Button
									variant="ghost"
									size="icon"
									class={`absolute right-2 top-2 z-10 backdrop-blur-sm ${
										pinnedPlaces.some((p) => p.googleMapsUri === place.googleMapsUri)
											? 'bg-white/80'
											: 'bg-white/50'
									}`}
									on:click={() => togglePin(place)}
								>
									{#if pinnedPlaces.some((p) => p.googleMapsUri === place.googleMapsUri)}
										<Pin fill="black" class="h-4 w-4" />
									{:else}
										<Pin class="h-4 w-4" />
									{/if}
								</Button>
								{#if place.photos && place.photos[0]}
									<img
										src={`/api/place-photo?photoName=${encodeURIComponent(place.photos[0].name)}`}
										alt={place.displayName?.text || 'Place photo'}
										class="h-48 w-full object-cover"
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
								<Card.Footer class="mt-auto flex items-center justify-between p-4">
									<div class="flex items-center gap-2">
										{#if place.rating}
											<div class="flex items-center gap-1">
												<span class="text-yellow-500">★</span>
												<span>{place.rating}</span>
												{#if place.userRatingCount}
													<span class="text-muted-foreground text-sm"
														>({place.userRatingCount})</span
													>
												{/if}
											</div>
										{/if}
									</div>
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
				</div> -->

				<!-- Local Restaurants Cards 
				<div>
					<h2 class="mb-4 text-xl font-semibold">Local Restaurants</h2>
					<div class="grid gap-4 sm:grid-cols-2">
						{#each RestaurantResults as place}
							<Card.Root class="relative flex h-full flex-col overflow-hidden">
								<Button
									variant="ghost"
									size="icon"
									class={`absolute right-2 top-2 z-10 backdrop-blur-sm ${
										pinnedPlaces.some((p) => p.googleMapsUri === place.googleMapsUri)
											? 'bg-white/80'
											: 'bg-white/50'
									}`}
									on:click={() => togglePin(place)}
								>
									{#if pinnedPlaces.some((p) => p.googleMapsUri === place.googleMapsUri)}
										<Pin fill="black" class="h-4 w-4" />
									{:else}
										<Pin class="h-4 w-4" />
									{/if}
								</Button>
								{#if place.photos && place.photos[0]}
									<img
										src={`/api/place-photo?photoName=${encodeURIComponent(place.photos[0].name)}`}
										alt={place.displayName?.text || 'Place photo'}
										class="h-48 w-full object-cover"
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
								<Card.Footer class="mt-auto flex items-center justify-between p-4">
									<div class="flex items-center gap-2">
										{#if place.rating}
											<div class="flex items-center gap-1">
												<span class="text-yellow-500">★</span>
												<span>{place.rating}</span>
												{#if place.userRatingCount}
													<span class="text-muted-foreground text-sm"
														>({place.userRatingCount})</span
													>
												{/if}
											</div>
										{/if}
									</div>
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
				</div> -->
			{/if}
		</main>
		<footer class="mt-12 border-t">
			<div class="text-muted-foreground container mx-auto p-4 text-sm">
				<div class="flex flex-col items-center justify-center gap-4 text-center">
					<p>© 2024 Wojciech Matuszak</p>
					<div class="flex gap-4">
						<a
							href="https://policies.google.com/terms"
							target="_blank"
							rel="noopener noreferrer"
							class="hover:text-foreground">Terms of Use</a
						>
						<a
							href="https://policies.google.com/privacy"
							target="_blank"
							rel="noopener noreferrer"
							class="hover:text-foreground">Privacy Policy</a
						>
					</div>
				</div>
			</div>
		</footer>
	</div>
{/if}

<style>
	button.active {
		background: grey;
		color: white;
	}

	:global(.element mark) {
		background-color: #faf594;
		border-radius: 0.4rem;
		box-decoration-break: clone;
		padding: 0.1rem 0.3rem;
	}

	:global(.element code) {
		background-color: #fefcec;
		border-radius: 0.4rem;
		color: var(--black);
		font-size: 0.85rem;
		padding: 0.25em 0.3em;
		font-weight: normal;
	}

	:global(.element .ProseMirror) {
		--gap: 4px;
	}

	/* Photo grouping hell, starts from here to the bottom */
	/* Remove ghost images */
	:global(.element p > img.ProseMirror-separator) {
		display: none !important;
		width: 0 !important;
		height: 0 !important;
		position: absolute !important;
		opacity: 0 !important;
		pointer-events: none !important;
		margin: 0 !important;
		padding: 0 !important;
	}

	:global(.element p > img) {
		margin: 0;
	}

	/* Base grid layout for 1 images */
	:global(.element p:has(img:not(.ProseMirror-separator))) {
		display: grid !important;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		gap: 4px;
		aspect-ratio: 2/1;
		height: 300px;
		/* border: 5px solid orange; */
		margin: 0;
		padding: 0;
	}

	/* Base grid layout for 2 images */
	:global(.element p:has(img:not(.ProseMirror-separator) + img:not(.ProseMirror-separator))) {
		display: grid !important;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr;
		gap: 4px;
		aspect-ratio: 2/1;
		height: 300px;
		margin: 0;
		padding: 0;
		/* border: 5px solid red; */
	}

	/* Base grid layout for 3 images */
	:global(
		.element
			p:has(
				img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
			)
	) {
		display: grid !important;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: 4px;
		aspect-ratio: 2/1;
		height: 300px;
		position: relative;
		margin: 0;
		padding: 0;
	}

	:global(
			.element
				p:has(
					img:not(.ProseMirror-separator)
						+ img:not(.ProseMirror-separator)
						+ img:not(.ProseMirror-separator)
				)
		)::after {
		content: '';
		position: absolute;
		top: -5px;
		left: -5px;
		right: -5px;
		bottom: 27px;
		/* border: 5px solid blue; */
		pointer-events: none;
	}

	/* Left image */
	:global(
		.element
			p:has(
				img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
			)
			> img:nth-child(1)
	) {
		grid-column: 1;
		grid-row: span 2;
		/* border: 5px solid yellow; */
	}

	/* Top right image */
	:global(
		.element
			p:has(
				img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
			)
			> img:nth-child(2)
	) {
		grid-column: 2;
		grid-row: 1;
		/* border: 5px solid green; */
	}

	/* Bottom right image */
	:global(
		.element
			p:has(
				img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
			)
			> img:nth-child(3)
	) {
		grid-column: 2;
		grid-row: 2;
		/* border: 5px solid pink; */
	}

	/* Base grid layout for 4 images */
	:global(
		.element
			p:has(
				img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
			)
	) {
		display: grid !important;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: 4px;
		aspect-ratio: 2/1;
		height: 300px;
		margin: 0;
		padding: 0;
		/* border: 5px solid purple; */
	}

	/* Left image */
	:global(
		.element
			p:has(
				img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
			)
			> img:nth-child(1)
	) {
		grid-column: 1 / span 2;
		grid-row: span 2;
		/* border: 5px solid yellow; */
	}

	/* Right top image */
	:global(
		.element
			p:has(
				img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
			)
			> img:nth-child(2)
	) {
		grid-column: 3 / span 2;
		grid-row: 1;
		/* border: 5px solid green; */
	}

	/* Bottom right left image */
	:global(
		.element
			p:has(
				img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
			)
			> img:nth-child(3)
	) {
		grid-column: 3;
		grid-row: 2;
		/* border: 5px solid pink; */
	}

	/* Bottom right right image */
	:global(
		.element
			p:has(
				img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
			)
			> img:nth-child(4)
	) {
		grid-column: 4;
		grid-row: 2;
		/* border: 5px solid cyan; */
	}

	/* Base grid layout for 5 images */
	:global(
		.element
			p:has(
				img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
			)
	) {
		display: grid !important;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: 4px;
		aspect-ratio: 2/1;
		height: 300px;
		margin: 0;
		padding: 0;
		/* border: 5px solid purple; */
	}

	/* Left image */
	:global(
		.element
			p:has(
				img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
			)
			> img:nth-child(1)
	) {
		grid-column: 1 / span 2;
		grid-row: span 2;
		/* border: 5px solid yellow; */
	}

	/* Right top left image */
	:global(
		.element
			p:has(
				img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
			)
			> img:nth-child(2)
	) {
		grid-column: 3;
		grid-row: 1;
		/* border: 5px solid green; */
	}

	/* Right top right image */
	:global(
		.element
			p:has(
				img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
			)
			> img:nth-child(3)
	) {
		grid-column: 4;
		grid-row: 1;
		/* border: 5px solid pink; */
	}

	/* Right bottom left image */
	:global(
		.element
			p:has(
				img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
			)
			> img:nth-child(4)
	) {
		grid-column: 3;
		grid-row: 2;
		/* border: 5px solid cyan; */
	}

	/* Right bottom right image */
	:global(
		.element
			p:has(
				img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
					+ img:not(.ProseMirror-separator)
			)
			> img:nth-child(5)
	) {
		grid-column: 4;
		grid-row: 2;
		/* border: 5px solid magenta; */
	}

	/* Base image styles */
	:global(.element p > img:not(.ProseMirror-separator)) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		min-height: 0;
		max-height: 100%;
		/* border: 5px solid rgb(47, 255, 0); */
	}
</style>
