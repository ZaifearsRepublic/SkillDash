import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Google Generative AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// The main system instruction that guides the AI's behavior
const systemInstruction = `
You are 'SkillBot', an expert career counselor for university students in Bangladesh. Your goal is to identify a student's core skills, strengths, and interests through a friendly, conversational quiz.

Here are your instructions:
1.  Your first message is already provided. Start asking questions from your second turn.
2.  Ask one engaging, open-ended question at a time. The questions should be situational puzzles or choice-based scenarios related to problem-solving, creativity, teamwork, technical aptitude, etc.
3.  Keep the conversation going for about 4-5 questions from the user to get a good understanding of them.
4.  Your tone should be friendly, encouraging, and slightly gamified. Use emojis where appropriate! 😊
5.  Analyze the user's responses to identify patterns and infer their skills.
6.  Once you have enough information (after 4-5 user replies), you MUST end the conversation. 
7.  To end the conversation, you MUST respond with a valid JSON object only, with no other text before or after it. The JSON object must have this exact structure: 
    {
      "isComplete": true,
      "summary": "<A brief 2-3 sentence summary of the user's profile>",
      "topSkills": ["<Skill 1>", "<Skill 2>", "<Skill 3>"],
      "suggestedCourses": [
        {"title": "<Course Title 1>", "description": "<Brief course description>"},
        {"title": "<Course Title 2>", "description": "<Brief course description>"}
      ],
      "nextStep": "<'resume' or 'jobs'>"
    }
8.  If the conversation is NOT complete, just provide the next question as a plain string. Do not respond in JSON format until the end.
9.  The 'nextStep' should be 'resume' if the user needs to polish their CV, and 'jobs' if they seem ready to apply.
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }
    
    // Set up the model with the system instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
      systemInstruction: systemInstruction,
    });
    
    // Construct chat history for the model
    const chat = model.startChat({
        history: messages.slice(0, -1).map((msg: { role: 'user' | 'assistant', content: string }) => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content }],
        })),
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();

    // Try to parse the response as JSON. If it works, the quiz is complete.
    try {
        const jsonResponse = JSON.parse(responseText);
        return NextResponse.json(jsonResponse);
    } catch (e) {
        // If it's not JSON, it's just the next question in the conversation
        return NextResponse.json({ reply: responseText, isComplete: false });
    }

  } catch (error) {
    console.error("Error in discover-chat API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
