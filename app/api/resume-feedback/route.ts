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

// Enhanced system instruction for structured JSON feedback (unchanged)
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

// CORRECTED: Your original three-tier model strategy
const groqCompoundModels = [
  "groq/compound",
  "groq/compound-mini"
];

const groqLlamaModels = [
  "llama-3.1-8b-instant"
];

interface GroqResult {
  success: boolean;
  content?: string;
  error?: string;
}

// STRATEGY 1: Try Groq Compound models first
async function tryGroqCompoundAPI(messages: {role: string, content: string}[], industryPreference: string, hasJobDescription: boolean): Promise<GroqResult> {
  if (!GROQ_API_KEY) {
    return { success: false, error: 'Groq API key not configured' };
  }

  const systemMessage = { 
    role: "system", 
    content: createSystemInstruction(industryPreference, hasJobDescription) 
  };
  const messagesForApi = [systemMessage, ...messages];

  for (const model of groqCompoundModels) {
    try {
      console.log(`🚀 Attempting Groq COMPOUND with model: ${model}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({ 
          model, 
          messages: messagesForApi,
          max_tokens: 2000,
          temperature: 0.3
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`❌ Groq COMPOUND model ${model} failed (${response.status})`);
        continue;
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        console.warn(`❌ Invalid Groq COMPOUND response from ${model}`);
        continue;
      }

      console.log(`✅ Groq COMPOUND successful with model: ${model}`);
      return { success: true, content: data.choices[0].message.content };

    } catch (error: any) {
      console.warn(`❌ Groq COMPOUND error with ${model}:`, error.name);
    }
  }

  return { success: false, error: 'all_groq_compound_models_failed' };
}

// STRATEGY 2: Try Groq LLAMA models as second fallback
async function tryGroqLlamaAPI(messages: {role: string, content: string}[], industryPreference: string, hasJobDescription: boolean): Promise<GroqResult> {
  if (!GROQ_API_KEY) {
    return { success: false, error: 'Groq API key not configured' };
  }

  const systemMessage = { 
    role: "system", 
    content: createSystemInstruction(industryPreference, hasJobDescription) 
  };
  const messagesForApi = [systemMessage, ...messages];

  for (const model of groqLlamaModels) {
    try {
      console.log(`🔄 Attempting Groq LLAMA with model: ${model}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({ 
          model, 
          messages: messagesForApi,
          max_tokens: 2000,
          temperature: 0.3
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`❌ Groq LLAMA model ${model} failed (${response.status})`);
        continue;
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        console.warn(`❌ Invalid Groq LLAMA response from ${model}`);
        continue;
      }

      console.log(`✅ Groq LLAMA successful with model: ${model}`);
      return { success: true, content: data.choices[0].message.content };

    } catch (error: any) {
      console.warn(`❌ Groq LLAMA error with ${model}:`, error.name);
    }
  }

  return { success: false, error: 'all_groq_llama_models_failed' };
}

// STRATEGY 3: Use Google Gemini as the final fallback
async function useGeminiAPI(messages: {role: string, content: string}[], industryPreference: string, hasJobDescription: boolean): Promise<string> {
  console.log('🔄 Final fallback to Google Gemini...');
  
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
  
  const chat = model.startChat({ 
    history,
    generationConfig: {
      maxOutputTokens: 1500,
      temperature: 0.3,
    }
  });
  
  const latestMessage = messages[messages.length - 1]?.content || '';
  const result = await chat.sendMessage(latestMessage);
  
  console.log('✅ Google Gemini successful');
  return result.response.text();
}

// Environment-aware timeout configuration
const getTimeouts = () => {
  const isVercel = process.env.VERCEL === '1';
  
  if (isVercel) {
    return { 
      groqCompound: 3000,  // 3s for compound models
      groqLlama: 3000,     // 3s for LLAMA models  
      gemini: 3000         // 3s for Gemini (total 9s < 10s Vercel limit)
    };
  }
  
  return { 
    groqCompound: 15000,   // 15s for compound models
    groqLlama: 15000,      // 15s for LLAMA models
    gemini: 25000          // 25s for Gemini
  };
};

// Input validation
const validateInputs = (body: any) => {
  const { resumeText, jobDescription } = body;
  
  if (resumeText && (typeof resumeText !== 'string' || resumeText.length > 15000)) {
    return { isValid: false, error: 'Resume text is invalid or too long (max 15,000 characters)' };
  }
  
  if (jobDescription && (typeof jobDescription !== 'string' || jobDescription.length > 8000)) {
    return { isValid: false, error: 'Job description is too long (max 8,000 characters)' };
  }
  
  return { isValid: true };
};

// --- Main API Route Handler ---
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let usedProvider = 'unknown';
  let fallbackReason = '';

  try {
    const body = await req.json();
    
    // Input validation
    const validation = validateInputs(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    const { 
      messages = [], 
      resumeText = null, 
      industryPreference = 'a general entry-level position',
      jobDescription = null 
    } = body;

    let apiMessages: { role: string; content: string }[] = [];
    const isInitialAnalysis = !!resumeText;

    if (isInitialAnalysis) {
      let prompt = `Please analyze this resume for a student interested in the ${industryPreference} industry.\n\n**Resume Content:**\n${resumeText}`;
      if (jobDescription) {
        prompt += `\n\n**Target Job Description:**\n${jobDescription}`;
      }
      apiMessages = [{ role: 'user', content: prompt }];
    } else {
      apiMessages = messages.map((msg: any) => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : 'User sent a complex message.'
      })).filter(msg => msg.role === 'user' || msg.role === 'assistant');
    }

    if (apiMessages.length === 0) {
      return NextResponse.json({ error: 'No content provided for analysis.' }, { status: 400 });
    }

    let feedback = '';
    const timeouts = getTimeouts();

    // THREE-TIER STRATEGY: Groq Compound → Groq LLAMA → Gemini
    try {
      // STRATEGY 1: Try Groq COMPOUND models first
      console.log('🚀 Step 1: Trying Groq COMPOUND models...');
      const compoundResult = await Promise.race([
        tryGroqCompoundAPI(apiMessages, industryPreference, !!jobDescription),
        new Promise<GroqResult>((_, reject) => 
          setTimeout(() => reject(new Error('Compound timeout')), timeouts.groqCompound)
        )
      ]);
      
      if (compoundResult.success && compoundResult.content) {
        feedback = compoundResult.content;
        usedProvider = 'groq-compound';
      } else {
        throw new Error(`Compound failed: ${compoundResult.error}`);
      }
      
    } catch (compoundError: any) {
      console.log(`❌ Groq COMPOUND failed: ${compoundError.message}`);
      
      try {
        // STRATEGY 2: Try Groq LLAMA models
        console.log('🔄 Step 2: Trying Groq LLAMA models...');
        const llamaResult = await Promise.race([
          tryGroqLlamaAPI(apiMessages, industryPreference, !!jobDescription),
          new Promise<GroqResult>((_, reject) => 
            setTimeout(() => reject(new Error('LLAMA timeout')), timeouts.groqLlama)
          )
        ]);
        
        if (llamaResult.success && llamaResult.content) {
          feedback = llamaResult.content;
          usedProvider = 'groq-llama';
          fallbackReason = compoundError.message;
        } else {
          throw new Error(`LLAMA failed: ${llamaResult.error}`);
        }
        
      } catch (llamaError: any) {
        console.log(`❌ Groq LLAMA failed: ${llamaError.message}`);
        
        // STRATEGY 3: Final fallback to Gemini
        console.log('🔄 Step 3: Final fallback to Gemini...');
        fallbackReason = `Compound: ${compoundError.message}, LLAMA: ${llamaError.message}`;
        
        const geminiMessages = apiMessages.map(m => ({...m, role: m.role === 'assistant' ? 'model' : 'user'}));
        
        feedback = await Promise.race([
          useGeminiAPI(geminiMessages, industryPreference, !!jobDescription),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Gemini timeout')), timeouts.gemini)
          )
        ]);
        
        usedProvider = 'gemini';
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Resume feedback completed in ${processingTime}ms using ${usedProvider}`);

    // Updated provider info to reflect the three strategies
    const providerInfo = (() => {
      switch (usedProvider) {
        case 'groq-compound':
          return 'Powered by Groq AI (Compound Models)';
        case 'groq-llama':
          return 'Powered by Groq AI (LLAMA Models)';
        case 'gemini':
          return `Powered by Google Gemini (Groq fallback: ${fallbackReason})`;
        default:
          return 'Powered by AI';
      }
    })();

    return NextResponse.json({ 
      feedback,
      isInitialAnalysis,
      providerInfo
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error(`Resume feedback error after ${processingTime}ms:`, error.message);
    
    if (error.message.includes('timeout')) {
      return NextResponse.json({ 
        error: 'Request timed out. Please try again with a shorter resume.' 
      }, { status: 408 });
    }
    
    return NextResponse.json({ 
      error: 'An unexpected error occurred.' 
    }, { status: 500 });
  }
}
