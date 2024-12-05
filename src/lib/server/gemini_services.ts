import { GOOGLE_GEMINI_API_KEY } from '$env/static/private';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);

export async function generateItinerary(places: any[], restaurants: any[],  cityName: string, full_address: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

    const prompt = `
    You are a professional travel guide writer. Write a 1-day itinerary for ${cityName} (${full_address}) using these points of interest:
    ${JSON.stringify(places, null, 2)}
    

     Requirements:
    - Format your response in HTML format, starting with <body> and ending with </body>
    - Start with a brief introduction about ${cityName} in <h1> tags
    - Use your own knowledge to enhance the itinerary and add interesting facts about the city
    - Structure the itinerary in three parts using <h2> tags:
      * Morning to Noon (9:00-13:00)
      * Afternoon (13:00-17:00)
      * Evening (17:00-22:00)
    - For each time block, recommend 2-3 suitable attractions and a place to eat
    - When mentioning a place for a first time, format it as: <a href="{googleMapsUri}" target="_blank" rel="noopener noreferrer">{displayName.text}</a>
    - Include specific details from editorialSummary, reviews and other provided data
    - Consider regularOpeningHours when suggesting visit times
    - Include practical tips for moving between locations using location data
    - Write in an engaging and conversational tone
    - Use <p> tags for paragraphs
    - Use <ul> and <li> for lists
    - Use <strong> for emphasis 
    - Remember: When mentioning a place for a first time, format it as: <a href="{googleMapsUri}" target="_blank" rel="noopener noreferrer">{displayName.text}</a>
    - Do not add any HTML head, doctype, or title tags
    - Do not ask any questions
    - Do not add any conclusions or next steps
    - End with the last evening attraction description

    Use the following restaurants:  ${JSON.stringify(restaurants, null, 2)}
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log('Generated itinerary:', response.text());
        return response.text();
    } catch (error) {
        console.error('Error generating itinerary:', error);
        throw new Error('Failed to generate itinerary');
    }
}
