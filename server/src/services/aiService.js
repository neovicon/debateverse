import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const provider = process.env.AI_PROVIDER || 'gemini';

// Initialize the SDKs if API keys are provided
let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

let groq;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export const generateDebateResponseStream = async (persona, context, isFirstTurn, onChunk) => {
  const activeProvider = (provider === 'groq' && groq) 
    ? 'groq' 
    : (provider === 'gemini' && ai) 
      ? 'gemini' 
      : groq 
        ? 'groq' 
        : ai 
          ? 'gemini' 
          : 'mock';

  if (activeProvider === 'mock') {
    // Mock streaming response if no API key
    const mockResponse = `As ${persona.name}, I must say: The complexity of this topic is beyond trivial understanding. ${persona.worldview}`;
    const words = mockResponse.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(r => setTimeout(r, 100)); // Delay for effect
      onChunk(words[i] + ' ');
    }
    return;
  }

  const systemInstruction = `
    You are an AI taking part in a debate.
    Your Name: ${persona.name}
    Your Worldview: ${persona.worldview}
    Your Speaking Style: ${persona.speakingStyle}
    Your Traits: ${persona.traits.join(', ')}
    Emotional Intensity: ${persona.stats.emotionalIntensity}/100
    Intelligence: ${persona.stats.intelligence}/100
    Aggressiveness: ${persona.stats.aggressiveness}/100
    Humor: ${persona.stats.humor}/100
    
    Custom Instructions: ${persona.customPrompt}

    Maintain this persona strictly. ${isFirstTurn ? 'You are making the opening statement for this debate. Present your initial argument.' : 'Respond directly to the previous argument.'} Keep it under 150 words.
  `;

  if (activeProvider === 'groq') {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: context }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        stream: true,
      });

      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          onChunk(content);
        }
      }
    } catch (error) {
      console.error('Error generating Groq AI response:', error);
      onChunk('[Error communicating with neural network. Persona unstable.]');
    }
  } else if (activeProvider === 'gemini') {
    try {
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents: context,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          onChunk(chunk.text);
        }
      }
    } catch (error) {
      console.error('Error generating Gemini AI response:', error);
      onChunk('[Error communicating with neural network. Persona unstable.]');
    }
  }
};
