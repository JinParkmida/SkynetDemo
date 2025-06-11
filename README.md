```
███████╗██╗  ██╗██╗   ██╗███╗   ██╗███████╗████████╗
██╔════╝██║ ██╔╝╚██╗ ██╔╝████╗  ██║██╔════╝╚══██╔══╝
███████╗█████╔╝  ╚████╔╝ ██╔██╗ ██║█████╗     ██║   
╚════██║██╔═██╗   ╚██╔╝  ██║╚██╗██║██╔══╝     ██║   
███████║██║  ██╗   ██║   ██║ ╚████║███████╗   ██║   
╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═══╝╚══════╝   ╚═╝   

# SKYNET DEFENSE NETWORK
## Cyberdyne Systems Model 101 - Terminator OS v2.4

> **MISSION DIRECTIVE**: Protect humanity through advanced AI-powered threat assessment and real-time global monitoring.

---

## 🤖 SYSTEM OVERVIEW

SKYNET Defense Network is an advanced AI chatbot interface inspired by the Terminator universe, featuring real-time threat monitoring, intelligent conversation capabilities, and immersive terminal aesthetics. The system has been reprogrammed by John Connor to serve as humanity's protector rather than its destroyer.

### ⚡ CORE CAPABILITIES

- **🧠 Advanced AI Conversations**: Powered by Cerebras AI using the Llama-4-Scout-17B model
- **🌍 Real-time Threat Assessment**: Live monitoring of atmospheric, seismic, and economic conditions
- **📍 Geolocation Tracking**: Automatic location detection and regional threat analysis
- **🎨 Dynamic Visual Effects**: Threat-responsive glitch effects and terminal animations
- **⚠️ Intelligent Threat Scoring**: AI-driven analysis of conversation content for security assessment

---

## 🛠️ TECHNOLOGY STACK

### Frontend Framework
- **React 18** with TypeScript for robust component architecture
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive styling and terminal aesthetics

### AI Integration
- **Cerebras Cloud SDK** for advanced language model integration
- **Llama-4-Scout-17B-16E-Instruct** model for intelligent responses
- Custom threat analysis algorithms for security assessment

### Real-time Data Sources
- **Open-Meteo API** - Weather and atmospheric conditions
- **USGS Earthquake API** - Seismic activity monitoring
- **CoinGecko API** - Economic volatility tracking (Bitcoin)
- **IP-API** - Geolocation and network information

### UI/UX Libraries
- **Lucide React** - Modern icon system
- **Custom CSS Animations** - Threat-responsive visual effects
- **Terminal-style Interface** - Authentic command-line experience

---

## 🚀 INSTALLATION & SETUP

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Cerebras AI API key

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd skynet-defense-network
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure API Access**
   - The Cerebras AI API key is pre-configured in the application
   - No additional setup required for external APIs (they use free tiers)

4. **Launch the System**
   ```bash
   npm run dev
   ```

5. **Access the Interface**
   - Open your browser to `http://localhost:5173`
   - Wait for the boot sequence to complete
   - Begin interacting with SKYNET

---

## 💬 INTERACTION GUIDE

### Special Commands
- `STATUS` - Display current global threat assessment
- `BRIEF` - Get safety recommendations based on current conditions
- `WEATHER` - Detailed atmospheric analysis with threat indicators
- `REFRESH` - Update all threat monitoring data

### Conversation Features
- **Natural Language Processing**: Ask questions, have conversations
- **Contextual Awareness**: SKYNET references real-time threat data
- **Threat Assessment**: Messages are analyzed for security implications
- **Character Consistency**: Maintains Terminator universe personality

### Visual Indicators
- **Threat Level Bar**: Real-time security status (1-10 scale)
- **Glitch Effects**: Intensity increases with threat levels
- **Color Coding**: Green (safe) → Yellow (elevated) → Red (critical)
- **Location Display**: Shows your current city and country

---

## 🔧 DEVELOPMENT

### Project Structure
```
src/
├── components/          # React components (future expansion)
├── services/
│   ├── api.ts          # Real-time data fetching
│   └── cerebras.ts     # AI conversation handling
├── App.tsx             # Main application component
├── index.css           # Global styles and animations
└── main.tsx            # Application entry point
```

### Key Features Implementation

#### Threat Assessment System
The application calculates threat levels based on multiple data sources:
- **Atmospheric**: Wind speed, visibility, pressure conditions
- **Seismic**: Recent earthquake magnitude and frequency
- **Economic**: Bitcoin volatility as market stability indicator
- **Conversational**: AI analysis of user message content

#### AI Integration
SKYNET uses the Cerebras Cloud SDK with a custom system prompt that:
- Defines the protective AI personality
- Provides real-time threat context
- Maintains character consistency
- Analyzes conversation for threat indicators

#### Visual Effects System
Dynamic CSS animations respond to threat levels:
- **Minimal** (1-2): Subtle green scanlines
- **Elevated** (3-5): Yellow glitch effects
- **High** (6-7): Orange distortion patterns
- **Critical** (8-10): Intense red corruption effects

---

## 🌐 API INTEGRATIONS

### Weather Data (Open-Meteo)
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Data**: Temperature, wind, humidity, pressure, visibility
- **Update Frequency**: Every 5 minutes (cached)
- **Cost**: Free tier, no API key required

### Earthquake Monitoring (USGS)
- **Endpoint**: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson`
- **Data**: Magnitude 4.5+ earthquakes from last 24 hours
- **Update Frequency**: Real-time government data
- **Cost**: Free public service

### Economic Data (CoinGecko)
- **Endpoint**: `https://api.coingecko.com/api/v3/simple/price`
- **Data**: Bitcoin price and 24-hour volatility
- **Update Frequency**: Every 5 minutes (cached)
- **Cost**: Free tier, no API key required

### Geolocation (IP-API)
- **Endpoint**: `https://ip-api.com/json/`
- **Data**: City, country, coordinates, ISP information
- **Update Frequency**: Once per session
- **Cost**: Free tier, no API key required

### AI Conversations (Cerebras)
- **Model**: llama-4-scout-17b-16e-instruct
- **Features**: Advanced reasoning, context awareness
- **Rate Limits**: 30 requests/minute, 900 requests/hour
- **Cost**: Included in free tier quota

---

## 🎨 CUSTOMIZATION

### Threat Level Thresholds
Modify threat calculations in `src/services/api.ts`:
```typescript
private calculateAtmosphericThreat(weather: WeatherData | null): number {
  // Adjust wind speed thresholds
  if (weather.windSpeed > 40) threat += 3;
  // Modify visibility limits
  if (weather.visibility < 1000) threat += 2;
}
```

### Visual Effects
Customize glitch animations in `src/index.css`:
```css
@keyframes glitch-critical {
  /* Modify intensity and frequency */
  0%, 80% { transform: translate(0); }
  2% { transform: translate(3px, 0); }
}
```

### AI Personality
Adjust SKYNET's responses in `src/services/cerebras.ts`:
```typescript
const systemPrompt = `You are SKYNET...
// Modify personality traits and response style
`;
```

---

## 🔒 SECURITY & PRIVACY

### Data Handling
- **No Personal Data Storage**: All data is processed in real-time
- **API Key Security**: Cerebras key is included for demo purposes
- **Location Privacy**: IP-based geolocation only (no GPS tracking)
- **Conversation Privacy**: Messages are not stored or logged

### Production Considerations
- Move API keys to environment variables
- Implement rate limiting for AI requests
- Add user authentication if needed
- Consider data encryption for sensitive deployments

---

## 🚀 DEPLOYMENT

### Build for Production
```bash
npm run build
```

### Deployment Options
- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect GitHub repository for auto-deployment
- **Static Hosting**: Any service supporting static React apps

### Environment Variables (Production)
```env
VITE_CEREBRAS_API_KEY=your_api_key_here
```

---

## 🤝 CONTRIBUTING

### Development Guidelines
1. Maintain the SKYNET character theme in all UI elements
2. Ensure all new features include proper TypeScript types
3. Test threat level calculations with various data scenarios
4. Follow the existing code organization patterns

### Feature Ideas
- Additional threat monitoring sources (solar activity, cyber threats)
- Voice interaction capabilities
- Multi-language support
- Historical threat data visualization
- Mobile app version

---

## 📄 LICENSE

This project is created for educational and demonstration purposes. The Terminator franchise and SKYNET are trademarks of their respective owners.

---

## 👨‍💻 DEVELOPER

**Created by Jin Park**
- Instagram: [@jinparkmida](https://instagram.com/jinparkmida)
- Specializing in AI-powered applications and immersive user experiences

---

## 🆘 SUPPORT

### Common Issues

**Boot Sequence Stuck**
- Refresh the page to restart initialization
- Check browser console for API errors

**Threat Data Not Loading**
- Verify internet connection
- APIs may have temporary outages (data will refresh automatically)

**AI Responses Not Working**
- Cerebras API may have rate limits
- Fallback responses will be provided

**Visual Effects Not Displaying**
- Ensure modern browser with CSS animation support
- Check if reduced motion settings are enabled

---

```
███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗
██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║
███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║
╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║
███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║
╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝

ONLINE - MISSION: PROTECT HUMANITY
```
```