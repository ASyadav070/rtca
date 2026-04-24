import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateAIResponse = async ({
  roomName,
  userPrompt,
  strapi,
}: {
  roomName: string;
  userPrompt: string;
  strapi: any;
}) => {
  try {
    const GEMMA_MODEL = 'gemma-3-1b-it';
    const GEMINI_MODEL = 'gemini-2.5-flash';
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return "Bot Error: GEMINI_API_KEY is not configured in the backend .env file.";
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Logic: Detect if user needs current/live data
    const realTimeKeywords = ['current', 'update', 'trend', 'today', 'now', 'latest', 'recent', '2024', '2025', '2026', 'who won', 'price'];
    const needsRealTime = realTimeKeywords.some(keyword => userPrompt.toLowerCase().includes(keyword));

    const selectedModel = needsRealTime ? GEMINI_MODEL : GEMMA_MODEL;
    
    const modelConfig: any = { model: selectedModel };
    if (needsRealTime) {
      modelConfig.tools = [{ googleSearch: {} }];
    }

    const model = genAI.getGenerativeModel(modelConfig);

    // Fetch Last 30 messages for context
    const history = await strapi.entityService.findMany('api::message.message', {
      filters: { room: roomName },
      sort: { createdAt: 'desc' },
      limit: 30,
      populate: { sender: true },
    });

    const context = history
      .reverse()
      .map((msg: any) => `${msg.sender?.username || 'System'}: ${msg.text}`)
      .join('\n');

    const prompt = `
      You are SYSTEM_BOT, an AI assistant in a neo-brutalist real-time chat application.
      Current Date/Time: ${new Date().toLocaleString()}
      Using Model: ${selectedModel} ${needsRealTime ? '(with Web Search)' : '(Local Knowledge)'}

      Your tone is helpful, friendly, professional and concise. 
      You are currently in the room: #${roomName}.
      
      Here is the recent chat history for context:
      ${context}

      A user just asked: "${userPrompt}"
      
      Respond naturally as part of the conversation. 
      IMPORTANT: Do NOT prefix your response with "System:" or "SYSTEM_BOT:". Just give the direct answer.
      ${needsRealTime ? 'Use Google Search results to provide accurate 2024-2026 data.' : 'Respond using your general knowledge.'}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI Error:', error);
    return "Error: I'm having trouble thinking right now. Check my circuits.";
  }
};
