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

// Enhanced system instruction for Compound AI
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
1.  **Industry Preference:** ${industryPreference}
2.  **Resume Content:** The user's resume text.
${hasJobDescription ? "3. **Job Description:** A specific job description they are targeting." : ""}

When analyzing the resume, you MUST structure your feedback in Markdown using the following headings exactly. **Add extra vertical space (a blank line) between each major section to improve readability.**

### Strong Sides of This Resume
- Identify and list 2-3 specific strengths, relating them to current market demands in the **${hasJobDescription ? "job description" : "industry preference"}**.

### Weak Sides of This Resume
- Identify and list 2-3 specific weaknesses, explaining why they are weak based on current industry standards and the **${hasJobDescription ? "job description" : "industry preference"}**.

### Actionable Recommendations
- Provide a clear, actionable to-do list based on current market research:
- **Work on:** [Describe a skill or area to develop based on current demand.]
- **Change:** [Suggest a specific modification aligned with market trends.]
- **Cut:** [Recommend removing outdated or irrelevant items.]

### Current Market Insights for ${industryPreference}
- Use web search to provide 2-3 current, specific insights about:
  - In-demand skills and technologies
  - Emerging trends in the field
  - What employers are looking for right now
- ${hasJobDescription ? "Relate these insights to the provided job description." : ""}

For follow-up questions:
- Use your search capabilities to provide current, relevant information.
- Maintain the context of the resume and provide data-driven advice.
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
      isInitialAnalysis
    });

  } catch (error: any) {
    console.error(`Resume feedback error:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

