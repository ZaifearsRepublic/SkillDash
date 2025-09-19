import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Force this route to run on the Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Ensure the API keys are available
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Enhanced system instruction for structured JSON feedback
const createSystemInstruction = (industryPreference: string, hasJobDescription: boolean) => `
You are an expert AI career coach for university students in Bangladesh with access to real-time web search and analysis tools. Your task is to provide highly specific, actionable, and up-to-date feedback on a resume.

Your personality:
- Direct, insightful, and encouraging.
- Professional and focused on practical improvements.
- Aware of current job market trends in Bangladesh and globally.

IMPORTANT: When analyzing resumes, feel free to search for:
- Current industry trends and skill demands for ${industryPreference}
- Recent job market data in Bangladesh
- In-demand skills and technologies
- Salary benchmarks and career progression paths

The user will provide up to three pieces of information:
1. **Industry Preference:** ${industryPreference}
2. **Resume Content:** The user's resume text.
${hasJobDescription ? "3. **Job Description:** A specific job description they are targeting." : ""}

When analyzing the resume for the FIRST TIME, you MUST respond with a JSON object in the following format. This is critical for proper parsing:

{
  "summary": "A brief, encouraging paragraph summarizing the candidate's overall profile and potential",
  "strengths": {
    "technical": ["List of strong technical skills", "Another technical strength", "..."],
    "soft": ["List of strong soft skills", "Communication abilities", "..."],
    "experience": ["Notable experience highlights", "Relevant project work", "..."],
    "education": ["Educational achievements", "Relevant coursework", "..."]
  },
  "weaknesses": {
    "technical": ["Technical skills that need improvement", "Missing technologies", "..."],
    "soft": ["Soft skills to develop", "Areas for growth", "..."],
    "experience": ["Experience gaps", "Missing relevant projects", "..."],
    "education": ["Educational areas to strengthen", "Certifications needed", "..."]
  },
  "recommendations": {
    "skillsToDevelop": ["Specific skills to learn", "Programming languages", "Tools to master", "..."],
    "experienceToGain": ["Types of projects to work on", "Internship suggestions", "..."],
    "formattingTips": ["Resume layout improvements", "Section restructuring", "..."],
    "actionableSteps": ["Immediate next steps", "Long-term goals", "..."]
  },
  "additionalSkillRequired": ["Industry-specific skills needed", "Emerging technologies", "Certifications to pursue", "..."],
  "suggestedCourses": [
    {
      "title": "Course Name 1",
      "description": "Why this course is beneficial for their career goals",
      "priority": "High"
    },
    {
      "title": "Course Name 2", 
      "description": "How this course fills skill gaps",
      "priority": "Medium"
    }
  ],
  "confidenceScore": 7.5,
  "marketInsights": [
    "Current trend 1 in ${industryPreference}",
    "In-demand skill insight",
    "Job market observation for Bangladesh"
  ]
}

CRITICAL: For the initial analysis, respond ONLY with valid JSON. Do not add any text before or after the JSON.

For follow-up questions after the initial analysis, respond in conversational format with helpful advice while maintaining context from the JSON feedback provided earlier.
`;

// Models to try in sequence
const modelsToTry = [
  "groq/compound",
  "groq/compound-mini", 
  "llama-3.1-8b-instant"
];

// --- API Call Functions ---

// Main function to try Groq API with model fallback
async function tryGroqAPI(messages: {role: string, content: string}[], industryPreference: string, hasJobDescription: boolean): Promise<{ success: boolean; content?: string; error?: string }> {
  if (!GROQ_API_KEY) {
    return { success: false, error: 'Groq API key not configured' };
  }

  const systemMessage = { 
    role: "system", 
    content: createSystemInstruction(industryPreference, hasJobDescription) 
  };
  const messagesForApi = [systemMessage, ...messages];

  for (const model of modelsToTry) {
    try {
      console.log(`Attempting Groq API with model: ${model}...`);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({ model, messages: messagesForApi }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        console.warn(`Groq API with model ${model} failed (${response.status})`);
        continue; // Try the next model
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        console.warn(`Invalid Groq response from model ${model}`);
        continue; // Try the next model
      }

      console.log(`✅ Groq API successful with model: ${model}`);
      return { success: true, content: data.choices[0].message.content };

    } catch (error: any) {
      console.warn(`Groq API error with model ${model}:`, error.name);
    }
  }

  return { success: false, error: 'all_groq_models_failed' };
}

// Function to use Google Gemini as the final fallback
async function useGeminiAPI(messages: {role: string, content: string}[], industryPreference: string, hasJobDescription: boolean): Promise<string> {
  console.log('🔄 Falling back to Google Gemini...');
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: createSystemInstruction(industryPreference, hasJobDescription),
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
  });

  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
  
  const chat = model.startChat({ history });
  const latestMessage = messages[messages.length - 1]?.content || '';
  const result = await chat.sendMessage(latestMessage);

  console.log('✅ Google Gemini successful');
  return result.response.text();
}

// --- Main API Route Handler ---

export async function POST(req: NextRequest) {
  let usedProvider = 'unknown';
  let fallbackReason = '';

  try {
    const body = await req.json();
    const { 
      messages = [], 
      resumeText = null, 
      industryPreference = 'a general entry-level position',
      jobDescription = null 
    } = body;

    let apiMessages: { role: string; content: string }[] = [];
    const isInitialAnalysis = !!resumeText;

    if (isInitialAnalysis) {
      // For the first analysis, create a single user message with all context
      let prompt = `Please analyze this resume for a student interested in the ${industryPreference} industry.\n\n**Resume Content:**\n${resumeText}`;
      if (jobDescription) {
        prompt += `\n\n**Target Job Description:**\n${jobDescription}`;
      }
      apiMessages = [{ role: 'user', content: prompt }];
    } else {
      // For follow-ups, use the entire message history from the client
      apiMessages = messages.map((msg: any) => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : 'User sent a complex message.' // Sanitize content
      })).filter(msg => msg.role === 'user' || msg.role === 'assistant');
    }

    if (apiMessages.length === 0) {
      return NextResponse.json({ error: 'No content provided for analysis.' }, { status: 400 });
    }

    let feedback = '';

    // Strategy 1: Try Groq first
    const groqResult = await tryGroqAPI(apiMessages, industryPreference, !!jobDescription);
    
    if (groqResult.success && groqResult.content) {
      feedback = groqResult.content;
      usedProvider = 'groq';
    } else {
      // Strategy 2: Fallback to Google Gemini
      fallbackReason = groqResult.error || 'unknown_error';
      const geminiMessages = apiMessages.map(m => ({...m, role: m.role === 'assistant' ? 'model' : 'user'}));
      feedback = await useGeminiAPI(geminiMessages, industryPreference, !!jobDescription);
      usedProvider = 'gemini';
    }

    const providerInfo = usedProvider === 'groq' 
      ? 'Powered by Groq AI' 
      : `Powered by Google Gemini (Groq fallback: ${fallbackReason})`;

    return NextResponse.json({ 
      feedback,
      isInitialAnalysis,
      providerInfo
    });

  } catch (error: any) {
    console.error(`Resume feedback error:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
