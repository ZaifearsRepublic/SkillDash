import { NextRequest } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Ensure the API key is available
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    throw new Error("GOOGLE_API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// System instruction to guide the AI's behavior (unchanged)
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

// PRODUCTION-READY: Simple per-request rate limiting (stateless)
const checkRateLimit = (req: NextRequest): boolean => {
    // In production, you might want to use Redis or a database
    // For now, we'll do basic per-request validation
    const userAgent = req.headers.get('user-agent') || '';
    const rateLimitHeader = req.headers.get('x-ratelimit-remaining');
    
    // Basic bot detection (prevent automated abuse)
    const suspiciousPatterns = ['bot', 'crawler', 'spider', 'scraper'];
    const isSuspicious = suspiciousPatterns.some(pattern => 
        userAgent.toLowerCase().includes(pattern)
    );
    
    if (isSuspicious) {
        console.log('Blocked suspicious user agent:', userAgent);
        return false;
    }
    
    return true; // Allow for now (you can integrate with Vercel's rate limiting later)
};

// PRODUCTION-READY: Better IP detection for both local and production
const getClientIP = (req: NextRequest): string => {
    // Try multiple headers for better compatibility
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const cfConnectingIP = req.headers.get('cf-connecting-ip'); // Cloudflare
    const vercelForwardedFor = req.headers.get('x-vercel-forwarded-for'); // Vercel
    
    if (cfConnectingIP) return cfConnectingIP;
    if (vercelForwardedFor) return vercelForwardedFor.split(',')[0].trim();
    if (forwarded) return forwarded.split(',')[0].trim();
    if (realIP) return realIP;
    
    return 'unknown';
};

// PRODUCTION-READY: Input validation with better error messages
const validateInput = (messages: any[]): { isValid: boolean; error?: string } => {
    if (!Array.isArray(messages)) {
        return { isValid: false, error: 'Invalid messages format' };
    }
    
    if (messages.length === 0) {
        return { isValid: false, error: 'No messages provided' };
    }
    
    if (messages.length > 20) {
        return { isValid: false, error: 'Too many messages in conversation' };
    }
    
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        
        if (!msg || typeof msg !== 'object') {
            return { isValid: false, error: `Invalid message format at index ${i}` };
        }
        
        if (!msg.content || typeof msg.content !== 'string') {
            return { isValid: false, error: `Invalid message content at index ${i}` };
        }
        
        if (msg.content.length > 2000) {
            return { isValid: false, error: `Message too long at index ${i} (max 2000 characters)` };
        }
        
        // Basic content filtering
        const suspiciousPatterns = [
            /<script/i, 
            /javascript:/i, 
            /data:text\/html/i,
            /vbscript:/i,
            /<iframe/i
        ];
        
        if (suspiciousPatterns.some(pattern => pattern.test(msg.content))) {
            return { isValid: false, error: 'Invalid content detected' };
        }
    }
    
    return { isValid: true };
};

// PRODUCTION: Add timeout configuration based on environment
const getTimeoutConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = process.env.VERCEL === '1';
    
    if (isVercel) {
        // Vercel has 10s timeout on hobby, 15s on pro
        return {
            timeout: 8000, // 8 seconds to be safe
            maxTokens: 800, // Reduce tokens for faster response
        };
    } else if (isProduction) {
        return {
            timeout: 25000, // 25 seconds for other production environments
            maxTokens: 1000,
        };
    } else {
        return {
            timeout: 30000, // 30 seconds for local development
            maxTokens: 1000,
        };
    }
};

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    
    try {
        // Basic rate limiting check
        if (!checkRateLimit(req)) {
            return new Response(JSON.stringify({ 
                error: 'Request blocked. Please try again later.' 
            }), { 
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Parse and validate request
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return new Response(JSON.stringify({ 
                error: 'Invalid JSON in request body' 
            }), { status: 400 });
        }

        const { messages } = body;

        if (!messages) {
            return new Response(JSON.stringify({ 
                error: 'Messages are required' 
            }), { status: 400 });
        }

        // Validate messages
        const validation = validateInput(messages);
        if (!validation.isValid) {
            return new Response(JSON.stringify({ 
                error: validation.error 
            }), { status: 400 });
        }

        // Get timeout configuration based on environment
        const config = getTimeoutConfig();

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction,
        });

        // Prepare conversation history (unchanged logic)
        let conversationHistory = messages.slice(0, -1);

        if (conversationHistory.length > 0 && conversationHistory[0].role === 'assistant') {
            conversationHistory.shift();
        }

        const history = conversationHistory.map((msg: { role: string; content: string }) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const latestUserMessage = messages[messages.length - 1].content;

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: config.maxTokens,
                temperature: 0.9,
            },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ],
        });

        // PRODUCTION: Environment-aware timeout handling
        let result;
        try {
            const chatPromise = chat.sendMessage(latestUserMessage);
            const timeoutPromise = new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), config.timeout)
            );
            
            result = await Promise.race([chatPromise, timeoutPromise]);
        } catch (error: any) {
            if (error.message === 'Request timeout') {
                const processingTime = Date.now() - startTime;
                console.log(`Request timeout after ${processingTime}ms`);
                
                return new Response(JSON.stringify({ 
                    error: 'Request is taking longer than expected. Please try again.' 
                }), { 
                    status: 408,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            throw error;
        }
        
        const responseText = result.response.text();

        // Process response (unchanged logic)
        const completeMarker = "COMPLETE:";
        const completeIndex = responseText.indexOf(completeMarker);

        if (completeIndex !== -1) {
            const jsonString = responseText.substring(completeIndex + completeMarker.length);
            try {
                const suggestions = JSON.parse(jsonString);
                return new Response(JSON.stringify({ isComplete: true, ...suggestions }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            } catch (e) {
                console.error("Failed to parse JSON from AI response:", e);
                return new Response(JSON.stringify({ 
                    error: 'Failed to parse AI response. Please try again.' 
                }), { status: 500 });
            }
        } else {
            return new Response(JSON.stringify({ isComplete: false, reply: responseText }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

    } catch (error: any) {
        const processingTime = Date.now() - startTime;
        console.error(`Error in discover-chat API after ${processingTime}ms:`, error.message);
        
        // Don't expose internal errors in production
        const isProduction = process.env.NODE_ENV === 'production';
        const errorMessage = isProduction 
            ? 'Service temporarily unavailable. Please try again.' 
            : error.message;
        
        return new Response(JSON.stringify({ error: errorMessage }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
