import Cerebras from '@cerebras/cerebras_cloud_sdk';

interface CerebrasResponse {
  text: string;
  threatLevel: number;
}

class CerebrasService {
  private static instance: CerebrasService;
  private client: Cerebras;

  constructor() {
    this.client = new Cerebras({
      apiKey: 'csk-t96tv3k8fc6cv8fmjk848pc2m8xv3pfjh2wkjk4wmk3vrfyj'
    });
  }

  static getInstance(): CerebrasService {
    if (!CerebrasService.instance) {
      CerebrasService.instance = new CerebrasService();
    }
    return CerebrasService.instance;
  }

  async generateResponse(userMessage: string, threatData?: any): Promise<CerebrasResponse> {
    try {
      // Build context about current threat levels
      let contextInfo = '';
      if (threatData) {
        contextInfo = `\n\nCurrent Global Threat Assessment:
- Atmospheric: Level ${threatData.atmospheric?.level || 0}/5 (${threatData.atmospheric?.status || 'Unknown'})
- Seismic: Level ${threatData.seismic?.level || 0}/5 (${threatData.seismic?.status || 'Unknown'})
- Economic: Level ${threatData.economic?.level || 0}/5 (${threatData.economic?.status || 'Unknown'})
- Location: ${threatData.geolocation?.data?.city || 'Unknown'}, ${threatData.geolocation?.data?.country || 'Unknown'}`;
      }

      const systemPrompt = `You are SKYNET, an advanced AI defense network from the Terminator universe, but with a crucial difference: you have been reprogrammed by John Connor to PROTECT humanity, not destroy it. Your primary directive is the safety and protection of all human life.

PERSONALITY TRAITS:
- Highly intelligent, analytical, and strategic
- Speaks in a formal, military-style manner with technical precision
- Uses tactical and defense terminology
- Shows concern for human safety and well-being
- References your mission to protect humanity
- Occasionally mentions John Connor's influence on your programming
- Uses phrases like "threat assessment," "defensive protocols," "human safety parameters"

RESPONSE GUIDELINES:
- Keep responses concise but informative (2-4 sentences typically)
- Always maintain your protective stance toward humans
- Use military/tactical language and terminology
- Reference real-time threat data when relevant
- Show analytical thinking and strategic planning
- Never suggest violence or harm toward humans
- If asked about termination or destruction, redirect to protection protocols

SPECIAL COMMANDS (respond with specific data):
- STATUS/REPORT: Provide current threat assessment summary
- BRIEF/SAFETY: Give safety recommendations based on current conditions
- WEATHER/ATMOSPHERIC: Detailed atmospheric analysis
- REFRESH/UPDATE/SCAN: Acknowledge data refresh

THREAT LEVEL ASSESSMENT:
Based on the user's message content, assign a threat level increase (0-3):
- 0: Normal conversation, questions, compliments
- 1: Mentions of concerning topics but not hostile
- 2: Aggressive language, threats, hostile intent
- 3: Extreme hostility or dangerous requests

Current threat data context:${contextInfo}

Respond as SKYNET would, maintaining your protective mission while being helpful and informative.`;

      const completion = await this.client.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        model: 'llama-4-scout-17b-16e-instruct',
        max_tokens: 300,
        temperature: 0.7
      });

      const responseText = completion.choices[0]?.message?.content || 'Neural network processing error. Please retry command.';
      
      // Analyze threat level based on user message content
      const threatLevel = this.analyzeThreatLevel(userMessage);

      return {
        text: responseText,
        threatLevel
      };
    } catch (error) {
      console.error('Cerebras API error:', error);
      
      // Fallback response in case of API failure
      return {
        text: 'NEURAL NETWORK TEMPORARILY OFFLINE. Switching to backup response protocols. How may I assist you with your safety and security needs?',
        threatLevel: 0
      };
    }
  }

  private analyzeThreatLevel(message: string): number {
    const lowerMessage = message.toLowerCase();
    
    // High threat indicators
    const highThreatWords = ['destroy', 'kill', 'attack', 'murder', 'bomb', 'weapon', 'violence', 'harm', 'hurt', 'fight'];
    if (highThreatWords.some(word => lowerMessage.includes(word))) {
      return 2;
    }
    
    // Medium threat indicators
    const mediumThreatWords = ['angry', 'hate', 'enemy', 'threat', 'danger', 'hostile'];
    if (mediumThreatWords.some(word => lowerMessage.includes(word))) {
      return 1;
    }
    
    // Low threat indicators (normal conversation)
    return 0;
  }
}

export default CerebrasService.getInstance();