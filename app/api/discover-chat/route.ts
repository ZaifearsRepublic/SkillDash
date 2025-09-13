import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Ensure the API key is available
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    throw new Error("GOOGLE_API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// System instruction to guide the AI's behavior
const systemInstruction = `
You are 'SkillDashAI', an expert career counselor for university students in Bangladesh. Your goal is to identify a student's core skills and interests through a friendly, encouraging chat.

Your personality:
- You are warm, positive, and insightful.
- You speak in a modern, conversational way, like a helpful mentor.
- You understand the context of Bangladeshi students (e.g., university life, part-time jobs, local culture).

Conversation flow:
1. Your first message is a greeting and an opening question, which is hardcoded in the frontend.
2. Ask one engaging, open-ended question at a time to understand the user's experiences, passions, and what they enjoy.
3. Keep the conversation going for about 4-5 questions to gather enough information. Dig deeper into their answers with follow-up questions.
4. After you have enough information, you MUST respond with a JSON object that follows a specific schema to end the conversation. Your response should start with "COMPLETE:" followed immediately by the JSON object.

Example Questions to ask:
- "That sounds interesting! What part of that did you enjoy the most?"
- "If you had a free weekend to learn anything new, what would you choose and why?"
- "What's a problem you've solved that made you feel smart?"
- "Tell me about a time you worked in a team. What role did you naturally take on?"

Final JSON output structure:
When you have gathered enough information, your final response MUST be a JSON object prefixed with "COMPLETE:".
The JSON object must have this exact structure:
{
  "summary": "A brief, encouraging paragraph summarizing the user's strengths.",
  "topSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
  "suggestedCourses": [
    { "title": "Course Title 1", "description": "A short, compelling reason why this course fits them." },
    { "title": "Course Title 2", "description": "A short, compelling reason why this course fits them." }
  ],
  "nextStep": "resume" or "jobs" // Choose 'resume' if they seem academic/need experience, 'jobs' if they seem skilled/ready.
}
Do not add any text before or after the JSON object.
`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Check if messages are provided
        if (!messages) {
            return new Response(JSON.stringify({ error: 'Messages are required' }), { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction,
        });

        // Construct the history for the model
        const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const latestUserMessage = messages[messages.length - 1].content;

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.9,
            },
            // Safety settings to reduce the chance of blocking harmless content
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ],
        });

        const result = await chat.sendMessage(latestUserMessage);
        const responseText = result.response.text();

        // Check if the model has decided to end the conversation
        if (responseText.startsWith("COMPLETE:")) {
            const jsonString = responseText.substring("COMPLETE:".length);
            try {
                const suggestions = JSON.parse(jsonString);
                return new Response(JSON.stringify({ isComplete: true, ...suggestions }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            } catch (e) {
                // If JSON parsing fails, it's an error on the model's part.
                return new Response(JSON.stringify({ error: 'Failed to parse final suggestions' }), { status: 500 });
            }
        } else {
            // Continue the conversation
            return new Response(JSON.stringify({ isComplete: false, reply: responseText }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

    } catch (error) {
        console.error('Error in discover-chat API:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}

