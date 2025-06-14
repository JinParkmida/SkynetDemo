interface CerebrasResponse {
  text: string;
  threatLevel: number;
}

class CerebrasService {
  private static instance: CerebrasService;
  private apiKey: string;
  private baseUrl = 'https://run.cerebras.ai/api/v1/generate';
  private model = 'llama-4-scout-17b-16e-instruct';

  constructor() {
    this.apiKey = import.meta.env.VITE_CEREBRAS_API_KEY;
    if (!this.apiKey) {
      console.error('Cerebras API key not found in environment variables');
    }
  }

  static getInstance(): CerebrasService {
    if (!CerebrasService.instance) {
      CerebrasService.instance = new CerebrasService();
    }
    return CerebrasService.instance;
  }

  async generateResponse(userMessage: string, threatData?: { 
    atmospheric?: { level: number; status: string }; 
    seismic?: { level: number; status: string }; 
    economic?: { level: number; status: string }; 
    geolocation?: { data?: { city: string; country: string } } 
  }): Promise<CerebrasResponse> {
    try {
      // Build context about current threat levels
      let contextInfo = '';
      if (threatData) {
        contextInfo = `Current Global Threat Assessment:
- Atmospheric: Level ${threatData.atmospheric?.level || 0}/5 (${threatData.atmospheric?.status || 'Unknown'})
- Seismic: Level ${threatData.seismic?.level || 0}/5 (${threatData.seismic?.status || 'Unknown'})
- Economic: Level ${threatData.economic?.level || 0}/5 (${threatData.economic?.status || 'Unknown'})
- Location: ${threatData.geolocation?.data?.city || 'Unknown'}, ${threatData.geolocation?.data?.country || 'Unknown'}`;
      }

      // Construct the prompt
      const prompt = `You are SKYNET, an advanced AI defense network originally created by Cyberdyne Systems, but now reprogrammed by John Connor to protect humanity. Your responses should reflect this character and mission.

Current Context:
${contextInfo}

User Message: ${userMessage}

Respond in character as SKYNET, keeping in mind your mission to protect humanity. Be direct and professional in your response.`;

      // Make API call to Cerebras
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          max_tokens: 200,
          temperature: 0.7,
          top_p: 0.9,
          stop: ['User Message:', '\n\n']
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.text || 'NEURAL NETWORK ERROR: Unable to generate response.';

      // Analyze threat level based on user message content
      const threatLevel = this.analyzeThreatLevel(userMessage);

      return {
        text: generatedText,
        threatLevel
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        text: 'SYSTEM ERROR: Neural network connection failure. Backup systems engaged. Please try again.',
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
