import { GoogleGenAI } from "@google/genai";
import { District } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSituationReport = async (districts: District[]): Promise<string> => {
  try {
    const highRiskDistricts = districts.filter(d => d.riskLevel === 'High' || d.riskLevel === 'Extreme');
    
    const prompt = `
      You are a Heatwave Risk Analyst for the State Disaster Management Authority.
      Analyze the following district data for Tamil Nadu:
      ${JSON.stringify(highRiskDistricts.map(d => ({ 
        name: d.name, 
        temp: d.currentTemp, 
        humidity: d.currentHumidity, 
        risk: d.riskLevel,
        vulnerable: d.vulnerability
      })))}

      Generate a concise, professional Situation Report (max 150 words). 
      Focus on immediate threats, vulnerable populations (elderly/outdoor workers), and priority actions.
      Format it as Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Unable to generate report at this time.";
  } catch (error) {
    console.error("Gemini Report Error:", error);
    return "Error generating situation report. Please check API configuration.";
  }
};

export const chatWithAssistant = async (message: string, contextDistricts: District[]): Promise<string> => {
    try {
        const prompt = `
        Context: You are HeatGuard AI, an assistant for health officials managing heatwaves.
        Current Data Summary: ${contextDistricts.length} districts monitored. ${contextDistricts.filter(d => d.riskLevel === 'Extreme').length} in Extreme risk.
        
        User Question: ${message}
        
        Answer professionally, citing standard heatwave protocols (HAP) where relevant. Keep it actionable.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        return response.text || "I'm sorry, I couldn't process that.";
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "System is currently offline or experiencing high traffic.";
    }
}