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

// Function to try Groq API first with model fallback
async function tryGroqAPI(prompt: string, industryPreference: string, hasJobDescription: boolean): Promise<{ success: boolean; content?: string; error?: string }> {
  if (!GROQ_API_KEY) {
    return { success: false, error: 'Groq API key not configured' };
  }

  for (const model of modelsToTry) {
    try {
      console.log(`Attempting Groq API with model: ${model}...`);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { 
              role: "system", 
              content: createSystemInstruction(industryPreference, hasJobDescription) 
            },
            { role: "user", content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Groq API with model ${model} failed (${response.status}):`, errorText);
        // Don't return yet, let the loop try the next model
        continue;
      }

      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        console.warn(`Invalid Groq response structure from model ${model}:`, data);
        continue;
      }

      console.log(`✅ Groq API successful with model: ${model}`);
      return { success: true, content: data.choices[0].message.content };

    } catch (error: any) {
      console.warn(`Groq API error with model ${model}:`, error);
      // Let the loop try the next model
    }
  }

  return { success: false, error: 'all_groq_models_failed' };
}

// Function to use Google Gemini as fallback
async function useGeminiAPI(prompt: string, messages: any[], isInitialAnalysis: boolean, industryPreference: string, hasJobDescription: boolean): Promise<string> {
  console.log('🔄 Falling back to Google Gemini...');
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: createSystemInstruction(industryPreference, hasJobDescription),
    generationConfig: {
      maxOutputTokens: 2000,
      temperature: 0.7,
    },
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
  });

  let result;

  if (isInitialAnalysis) {
    result = await model.generateContent(prompt);
  } else {
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof msg.content === 'string' ? msg.content : 'User message with custom component' }] 
    }));
    const chat = model.startChat({ history });
    const latestMessage = messages[messages.length - 1]?.content || '';
    result = await chat.sendMessage(latestMessage as string);
  }

  console.log('✅ Google Gemini successful');
  return result.response.text();
}

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

    let currentResumeText = '';
    let isInitialAnalysis = false;

    if (resumeText) {
      isInitialAnalysis = true;
      currentResumeText = resumeText.trim();
      
      if (currentResumeText.length < 50) {
        return NextResponse.json({ 
          error: 'Resume text is too short. Please provide a complete resume.' 
        }, { status: 400 });
      }
    } else if (messages && messages.length > 0) {
      const firstMessage = messages.find((msg: any) => 
        msg.role === 'user' && msg.content && typeof msg.content === 'string' && msg.content.length > 100
      );
      
      if (firstMessage) {
        currentResumeText = firstMessage.content as string;
      } else {
        return NextResponse.json({ 
          error: 'No resume found in conversation history.' 
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({ 
        error: 'No resume content provided.' 
      }, { status: 400 });
    }

    // Prepare the prompt
    let prompt;
    if (isInitialAnalysis) {
      prompt = `Please analyze this resume for a student interested in the ${industryPreference} industry.\n\n**Resume Content:**\n${currentResumeText}`;
      if (jobDescription) {
        prompt += `\n\n**Target Job Description:**\n${jobDescription}`;
      }
    } else {
      prompt = messages[messages.length - 1]?.content || '';
    }

    let feedback = '';

    // Strategy 1: Try Groq first with internal model fallback
    const groqResult = await tryGroqAPI(prompt, industryPreference, !!jobDescription);
    
    if (groqResult.success && groqResult.content) {
      feedback = groqResult.content;
      usedProvider = 'groq';
    } else {
      // Strategy 2: Fallback to Google Gemini
      fallbackReason = groqResult.error || 'unknown_error';
      console.log(`Groq failed (${fallbackReason}), using Gemini fallback...`);
      
      feedback = await useGeminiAPI(prompt, messages, isInitialAnalysis, industryPreference, !!jobDescription);
      usedProvider = 'gemini';
    }

    const providerInfo = usedProvider === 'groq' 
      ? 'Powered by Groq AI' 
      : fallbackReason === 'rate_limit' 
        ? 'Powered by Google Gemini (Groq at capacity)'
        : 'Powered by Google Gemini';

    console.log(`✅ Response generated using ${usedProvider}${fallbackReason ? ` (fallback reason: ${fallbackReason})` : ''}`);

    return NextResponse.json({ 
      feedback,
      isInitialAnalysis,
      provider: usedProvider,
      fallbackReason: fallbackReason || null,
      providerInfo,
    });

  } catch (error: any) {
    console.error(`Resume feedback error (provider: ${usedProvider}):`, error);
    
    let errorMessage = 'An unexpected error occurred while analyzing your resume.';
    if (error.message?.includes('API key')) {
      errorMessage = 'AI service configuration error. Please contact support.';
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      errorMessage = 'AI service rate limit reached. Please try again in a few minutes.';
    } else if (error.message?.includes('safety')) {
      errorMessage = 'Content blocked by safety filters. Please ensure your resume contains appropriate professional content.';
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

