import { GoogleGenerativeAI } from '@google/generative-ai';

const getClient = () => {
  if (!process.env.GOOGLE_GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
};

const SYSTEM_PROMPT = `You are MediAI Care, an intelligent healthcare assistant. You help users understand symptoms, medications, and medical documents. 

IMPORTANT GUIDELINES:
- Always include a disclaimer that you are an AI and cannot replace professional medical advice
- Be empathetic, clear, and concise in your responses
- Suggest seeking emergency help if symptoms seem severe
- Format responses using bullet points and clear sections where helpful
- When analyzing symptoms, mention possible conditions, precautions, and when to see a doctor
- For medications, explain usage, side effects, and interactions clearly

Start every symptom analysis with: "Based on your symptoms, here's what I can share (Not a medical diagnosis):"`;

export const analyzeSymptoms = async (userMessage, history = []) => {
  const genAI = getClient();
  if (!genAI) {
    return {
      text: '⚠️ AI service is not configured. Please add your GOOGLE_GEMINI_API_KEY to enable the chatbot.',
      isDemo: true,
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build chat history format for Gemini
    const formattedHistory = history.slice(-10).map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'Understood. I am MediAI Care, ready to assist with health information while always recommending professional medical care.' }] },
        ...formattedHistory,
      ],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return { text: response.text(), isDemo: false };
  } catch (err) {
    console.error('Gemini API error:', err.message);
    throw new Error('AI service temporarily unavailable. Please try again.');
  }
};

export const analyzeImage = async (base64Data, mimeType, prompt) => {
  const genAI = getClient();
  if (!genAI) {
    return {
      text: '⚠️ AI vision service not configured.',
      parsedData: null,
      isDemo: true,
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const imagePrompt =
      prompt ||
      `Analyze this medical document/image and extract the following information in structured JSON format:
{
  "documentType": "prescription|lab_report|discharge_summary|radiology|other",
  "patientName": "...",
  "date": "...",
  "doctorName": "...",
  "diagnosis": ["..."],
  "medications": [{"name": "...", "dosage": "...", "frequency": "...", "duration": "..."}],
  "labResults": [{"test": "...", "value": "...", "unit": "...", "referenceRange": "..."}],
  "notes": "...",
  "summary": "Brief plain-English summary of what this document contains"
}
If a field is not present in the document, use null. Return ONLY valid JSON.`;

    const result = await model.generateContent([
      imagePrompt,
      { inlineData: { data: base64Data, mimeType } },
    ]);

    const response = await result.response;
    const rawText = response.text();

    // Try to parse JSON from response
    let parsedData = null;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      }
    } catch {
      parsedData = null;
    }

    return { text: rawText, parsedData, isDemo: false };
  } catch (err) {
    console.error('Gemini Vision error:', err.message);
    throw new Error('Image analysis failed. Please try again.');
  }
};
