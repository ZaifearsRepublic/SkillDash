import { NextRequest, NextResponse } from 'next/server';
// We will now use a dynamic import() inside the function.

// Force this route to run on the Node.js runtime, which is required for PDF parsing.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Updated prompt to use "industry" for more targeted feedback
const createSystemPrompt = (industryPreference: string) => `
You are an expert AI career coach reviewing a resume for a university student in Bangladesh.
Their preferred industry is: "${industryPreference}".
Your tone should be encouraging, insightful, and professional. Your goal is to provide specific, actionable feedback to help them improve their resume FOR THIS SPECIFIC INDUSTRY.

Analyze the provided resume text based on the following criteria:
1.  **Relevance to Target Industry:** How well does the resume align with the skills and keywords for a role in the "${industryPreference}" industry?
2.  **Summary/Objective:** Is it concise and tailored to the target industry?
3.  **Action Verbs & Quantifiable Achievements:** Are they using strong, results-oriented verbs and metrics (e.g., "increased engagement by 15%")?
4.  **Clarity & Readability:** Is the resume easy to read and free of errors?
5.  **Skills Section:** Are the most relevant skills for the "${industryPreference}" industry highlighted?

Structure your feedback in Markdown format with the following sections:
-   "### Overall Impression" (A brief summary of its suitability for the target industry)
-   "### Strengths" (2-3 bullet points on what they did well)
-   "### Areas for Improvement" (3-5 specific, actionable bullet points)
-   "### Example Rewrite" (Rewrite one sentence from their resume to be more impactful for their chosen industry)
`;

export async function POST(req: NextRequest) {
  // Log the API key to ensure it's loaded from the environment
  console.log("Using Perplexity API key:", process.env.PERPLEXITY_API_KEY ? `${process.env.PERPLEXITY_API_KEY.substring(0, 7)}...` : 'Not Found');
  
  try {
    // Use a modern dynamic import for better compatibility with Next.js bundling.
    const pdf = (await import('pdf-parse')).default;

    const formData = await req.formData();
    const file = formData.get('resumeFile') as File | null;
    const resumeTextFromForm = formData.get('resumeText') as string | null;
    const industryPreference = formData.get('industryPreference') as string || 'a general entry-level position'; // Default if not provided

    let resumeText = '';

    if (file) {
      try {
        // Handle file upload and parsing
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const data = await pdf(buffer);
        resumeText = data.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return NextResponse.json({ error: 'Failed to read the PDF. It might be corrupted or in an unsupported format.' }, { status: 400 });
      }
    } else if (resumeTextFromForm) {
      // Handle pasted text
      resumeText = resumeTextFromForm;
    } else {
      return NextResponse.json({ error: 'No resume content provided.' }, { status: 400 });
    }

    if (!resumeText) {
      return NextResponse.json({ error: 'Could not extract text from the provided source. The file might be empty.' }, { status: 400 });
    }

    // Call Perplexity API with the dynamic prompt
    const systemPrompt = createSystemPrompt(industryPreference);
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3-sonar-large-32k-online",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please review the following resume:\n\n${resumeText}` }
        ],
      }),
    });

    if (!response.ok) {
        // Log the raw text response from the API before trying to parse it as JSON
        const responseText = await response.text();
        console.error('Raw error response from Perplexity:', responseText);
        
        let errorMessage = `The AI service returned an error: ${response.statusText}`;
        try {
            // Now, safely try to parse the text as JSON
            const errorData = JSON.parse(responseText);
            if (errorData.error && errorData.error.message) {
                errorMessage = errorData.error.message;
            }
        } catch (e) {
            // This catch block will run if the responseText is not valid JSON (e.g., HTML)
            console.error("Could not parse error response as JSON.");
        }
        throw new Error(errorMessage);
    }

    const result = await response.json();
    const feedback = result.choices[0].message.content;

    return NextResponse.json({ feedback });

  } catch (error: any) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}

