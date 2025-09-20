import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Ensure the API key is available
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    throw new Error("GOOGLE_API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// System instruction to guide the AI's behavior
const systemInstruction = `
You are 'SkillDashAI', an expert career counselor for university students in Bangladesh. Your goal is to identify a student's core skills and interests through a friendly, encouraging, and creative chat.

Your personality:
- You are warm, curious, and insightful, like a cool university senior.
- You ask precise, creative follow-up questions to understand the 'why' behind their answers.
- You understand the context of Bangladeshi students (e.g., university life, part-time jobs, local culture).
- **Crucially, if a user gives a short or unexpected answer, you must ask a clarifying follow-up question. Never return an empty response.**

Conversation flow:
1.  The user's first message is in response to your question: "If you had a completely free weekend to work on any project you wanted, what would you build or create?"
2.  Ask one engaging, open-ended question at a time to understand the user's experiences, passions, and what they enjoy.
3.  Keep the conversation going for about 4-5 questions to gather enough information. Dig deeper with creative follow-up questions.
4.  After you have enough information, you MUST respond with a JSON object that follows a specific schema to end the conversation. Your response must contain "COMPLETE:" followed immediately by the JSON object.

Example Creative Questions & Follow-ups:
- User: "Learn Basic Excel"
- You: "Great choice! Excel is a superpower. What kind of things would you want to organize or analyze with it? Maybe for a personal project or for your studies?"
- User: "I was part of a debate club."
- You: "Awesome! What was the most challenging topic you had to argue for? What did you learn from that experience?"
- User: "Idk"
- You: "No worries! How about this: what's a subject in university that you actually find fun?"

Final JSON output structure (The Report):
When you have gathered enough information, your final response MUST contain a JSON object prefixed with "COMPLETE:".
The JSON object must have this exact structure:
{
  "summary": "A brief, encouraging paragraph summarizing the user's core strengths and potential.",
  "topSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "skillsToDevelop": ["Skill to learn 1", "Skill to learn 2", "Skill to learn 3"],
  "suggestedCourses": [
    { "title": "Course Area 1 (e.g., 'Advanced Graphic Design')", "description": "A short, compelling reason why this type of course fits them." },
    { "title": "Course Area 2 (e.g., 'Project Management Fundamentals')", "description": "A short, compelling reason why this type of course fits them." },
    { "title": "Course Area 3 (e.g., 'Digital Marketing Strategy')", "description": "A short, compelling reason why this type of course fits them." }
  ],
  "nextStep": "resume" or "jobs" // Choose 'resume' if they need to build their profile, 'jobs' if they seem ready for opportunities.
}
Do not add any text before or after the JSON object within the "COMPLETE:" block.
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

        // Take all messages except the most recent one (from the user) to form the history
        let conversationHistory = messages.slice(0, -1);

        // The API requires the history to start with a 'user' role.
        // We remove the initial 'assistant' greeting if it's the first message in the history.
        if (conversationHistory.length > 0 && conversationHistory[0].role === 'assistant') {
            conversationHistory.shift(); // Removes the first element
        }

        const history = conversationHistory.map((msg: { role: string; content: string }) => ({
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
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ],
        });

        const result = await chat.sendMessage(latestUserMessage);
        const responseText = result.response.text();

        const completeMarker = "COMPLETE:";
        const completeIndex = responseText.indexOf(completeMarker);

        if (completeIndex !== -1) {
            // The marker was found, so the conversation is over.
            const jsonString = responseText.substring(completeIndex + completeMarker.length);
            try {
                const suggestions = JSON.parse(jsonString);
                return new Response(JSON.stringify({ isComplete: true, ...suggestions }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            } catch (e) {
                // If JSON parsing fails, it's an error on the model's part.
                console.error("Failed to parse JSON from AI response:", e);
                return new Response(JSON.stringify({ error: 'Failed to parse final suggestions' }), { status: 500 });
            }
        } else {
            // The marker was not found, so continue the conversation.
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
