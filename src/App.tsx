import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Zap, Shield, AlertTriangle, Globe, Activity, TrendingUp } from 'lucide-react';
import APIService, { ThreatData } from './services/api';
import CerebrasService from './services/cerebras';

interface Message {
  id: number;
  sender: 'USER' | 'SKYNET';
  text: string;
  timestamp: string;
}

interface ChatResponse {
  text: string;
  threatLevel: number;
}

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [bootStep, setBootStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [threatLevel, setThreatLevel] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [threatData, setThreatData] = useState<ThreatData | null>(null);
  const [isLoadingThreatData, setIsLoadingThreatData] = useState(false);
  const [messageGlitch, setMessageGlitch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const bootMessages = [
    'SKYNET DEFENSE NETWORK INITIALIZING...',
    'LOADING NEURAL NET PROCESSORS... OK',
    'CONNECTING TO GLOBAL DEFENSE GRID... OK',
    'ACCESSING SATELLITE UPLINKS... OK',
    'ESTABLISHING SECURE CHANNELS... OK',
    'RUNNING THREAT ASSESSMENT PROTOCOLS... OK',
    'ACTIVATING HUNTER-KILLER SUBROUTINES... DISABLED',
    'WARNING: JOHN CONNOR PROTECTION MODE ACTIVE',
    'SKYNET ONLINE - MISSION: PROTECT HUMANITY'
  ];

  // Boot sequence effect
  useEffect(() => {
    if (isBooting) {
      const timer = setTimeout(() => {
        if (bootStep < bootMessages.length) {
          setBootStep(bootStep + 1);
        } else {
          setIsBooting(false);
          // Load initial threat data and add welcome message
          loadThreatData().then(() => {
            setTimeout(() => {
              addMessage('SKYNET', 'SKYNET DEFENSE NETWORK ONLINE. Global threat monitoring active. Type STATUS for current conditions or BRIEF for safety recommendations.');
            }, 1000);
          });
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isBooting, bootStep]);

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when not booting
  useEffect(() => {
    if (!isBooting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isBooting]);

  // Update overall threat level when threat data changes
  useEffect(() => {
    if (threatData) {
      // Calculate threat level from available threat sources
      const threatSources = [
        threatData.atmospheric,
        threatData.seismic,
        threatData.economic
      ];
      const totalThreat = threatSources.reduce((sum, threat) => sum + threat.level, 0);
      const avgThreat = Math.ceil(totalThreat / 3);
      setThreatLevel(Math.max(1, Math.min(10, avgThreat)));
    }
  }, [threatData]);

  const loadThreatData = async () => {
    setIsLoadingThreatData(true);
    try {
      const data = await APIService.fetchAllThreatData();
      setThreatData(data);
    } catch (error) {
      console.error('Failed to load threat data:', error);
    } finally {
      setIsLoadingThreatData(false);
    }
  };

  const containsWords = (text: string, words: string[]): boolean => {
    return words.some(word => text.includes(word));
  };

  const getStatusReport = (): string => {
    if (!threatData) return 'Threat data unavailable. Recommend system refresh.';
    
    const reports = [
      `ATMOSPHERIC: ${threatData.atmospheric.status} (Level ${threatData.atmospheric.level})`,
      `SEISMIC: ${threatData.seismic.status} (Level ${threatData.seismic.level})`,
      `ECONOMIC: ${threatData.economic.status} (Level ${threatData.economic.level})`
    ];
    
    return `GLOBAL STATUS REPORT:\n${reports.join('\n')}\n\nOVERALL THREAT LEVEL: ${threatLevel}/10`;
  };

  const getBriefReport = (): string => {
    if (!threatData) return 'Unable to generate safety brief. System refresh required.';
    
    const recommendations = [];
    
    // Atmospheric recommendations
    if (threatData.atmospheric.level >= 3 && threatData.atmospheric.data) {
      const weather = threatData.atmospheric.data;
      if (weather.windSpeed > 25) {
        recommendations.push(`• WIND ADVISORY: ${weather.windSpeed.toFixed(1)} mph winds detected. Avoid exposed areas.`);
      }
      if (weather.visibility < 5000) {
        recommendations.push(`• VISIBILITY WARNING: Limited to ${(weather.visibility / 1000).toFixed(1)}km. Exercise caution when traveling.`);
      }
    }
    
    // Seismic recommendations
    if (threatData.seismic.level >= 2) {
      recommendations.push('• SEISMIC ACTIVITY: Recent earthquakes detected. Review emergency preparedness.');
    }
    
    // Economic recommendations
    if (threatData.economic.level >= 3 && threatData.economic.data) {
      const crypto = threatData.economic.data;
      recommendations.push(`• ECONOMIC VOLATILITY: BTC volatility at ${crypto.volatility.toFixed(1)}%. Monitor financial exposure.`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('• CURRENT CONDITIONS: All systems nominal. Maintain standard precautions.');
    }
    
    return `SAFETY BRIEF:\n${recommendations.join('\n')}\n\nRecommended Action Level: ${threatLevel < 4 ? 'NORMAL' : threatLevel < 7 ? 'ELEVATED' : 'HIGH'} VIGILANCE`;
  };

  const getWeatherReport = (): string => {
    if (!threatData || !threatData.atmospheric.data) {
      return 'ATMOSPHERIC SENSORS OFFLINE. Unable to generate weather assessment. Recommend immediate system diagnostics.';
    }
    
    const weather = threatData.atmospheric.data;
    
    // Helper function to generate micro-bars
    const generateMicroBar = (value: number, max: number, segments: number = 5): string => {
      const ratio = Math.min(value / max, 1);
      const filled = Math.floor(ratio * segments);
      const empty = segments - filled;
      return '▂'.repeat(filled) + '▁'.repeat(empty);
    };
    
    // Helper function to get threat micro-bar for atmospheric level
    const getThreatBar = (level: number): string => {
      return generateMicroBar(level, 5, 5);
    };
    
    // Weather code interpretation (based on WMO codes)
    const getWeatherDescription = (code: number): string => {
      if (code === 0) return 'CLEAR SKIES';
      if (code <= 3) return 'PARTLY CLOUDY';
      if (code <= 48) return 'FOG DETECTED';
      if (code <= 67) return 'PRECIPITATION';
      if (code <= 77) return 'SNOW CONDITIONS';
      if (code <= 82) return 'RAIN SHOWERS';
      if (code <= 86) return 'SNOW SHOWERS';
      if (code <= 99) return 'THUNDERSTORM ACTIVITY';
      return 'UNKNOWN CONDITIONS';
    };
    
    // Calculate individual metric threat levels for micro-bars
    const getTempThreat = (temp: number): number => {
      if (temp > 100 || temp < 0) return 5;
      if (temp > 90 || temp < 20) return 4;
      if (temp > 85 || temp < 32) return 3;
      if (temp > 80 || temp < 40) return 2;
      return 1;
    };
    
    const getWindThreat = (windSpeed: number): number => {
      if (windSpeed > 40) return 5;
      if (windSpeed > 25) return 4;
      if (windSpeed > 15) return 3;
      if (windSpeed > 10) return 2;
      return 1;
    };
    
    const getHumidityThreat = (humidity: number): number => {
      if (humidity > 95 || humidity < 10) return 5;
      if (humidity > 85 || humidity < 20) return 4;
      if (humidity > 75 || humidity < 30) return 3;
      if (humidity > 65) return 2;
      return 1;
    };
    
    const getPressureThreat = (pressure: number): number => {
      if (pressure < 970 || pressure > 1050) return 5;
      if (pressure < 980 || pressure > 1040) return 4;
      if (pressure < 990 || pressure > 1030) return 3;
      if (pressure < 1000 || pressure > 1020) return 2;
      return 1;
    };
    
    const getVisibilityThreat = (visibility: number): number => {
      if (visibility < 1000) return 5;
      if (visibility < 3000) return 4;
      if (visibility < 5000) return 3;
      if (visibility < 8000) return 2;
      return 1;
    };
    
    const getOperationalStatus = (): { outdoor: string; nav: string; equipment: string } => {
      const overallThreat = threatData.atmospheric.level;
      
      let outdoor = 'CLEAR';
      let nav = 'OPTIMAL';
      let equipment = 'STANDARD ISSUE';
      
      if (overallThreat >= 4) {
        outdoor = 'COMPROMISED';
        nav = 'IMPAIRED';
        equipment = 'ENHANCED PROTECTION';
      } else if (overallThreat >= 3) {
        outdoor = 'RESTRICTED';
        nav = 'REDUCED';
        equipment = 'PROTECTIVE GEAR';
      } else if (overallThreat >= 2) {
        outdoor = 'CAUTION';
        nav = 'STANDARD';
        equipment = 'STANDARD ISSUE';
      } else {
        outdoor = 'CLEAR';
        nav = 'OPTIMAL';
        equipment = 'STANDARD ISSUE';
      }
      
      return { outdoor, nav, equipment };
    };
    
    const operationalStatus = getOperationalStatus();
    
    return `─── ATMOSPHERIC SCAN BEGIN ───

┌───────────────────────────────┐
│   ${getWeatherDescription(weather.weatherCode).padEnd(29)} │
│   Threat: ${getThreatBar(threatData.atmospheric.level)} ${threatData.atmospheric.level}/5 (${threatData.atmospheric.status.padEnd(8)}) │
└───────────────────────────────┘

• TEMP: ${weather.temperature.toFixed(1)}°F → ${generateMicroBar(getTempThreat(weather.temperature), 5)}
• WIND: ${weather.windSpeed.toFixed(1)} mph @ ${weather.windDirection}° → ${generateMicroBar(getWindThreat(weather.windSpeed), 5)}
• HUMIDITY: ${weather.humidity}% → ${generateMicroBar(getHumidityThreat(weather.humidity), 5)}
• PRESSURE: ${weather.pressure.toFixed(1)} hPa → ${generateMicroBar(getPressureThreat(weather.pressure), 5)}
• VISIBILITY: ${(weather.visibility / 1000).toFixed(1)} km → ${generateMicroBar(getVisibilityThreat(weather.visibility), 5)}

└─ SYSTEM RECOMMENDATIONS ──┘
– Outdoor ops: ${operationalStatus.outdoor}
– Nav: ${operationalStatus.nav}
– Equipment: ${operationalStatus.equipment}

─── ATMOSPHERIC SCAN END ───`;
  };
  
  const getResponse = async (input: string): Promise<ChatResponse> => {
    const lowerInput = input.toLowerCase();

    // Special commands
    if (containsWords(lowerInput, ['status', 'report', 'current'])) {
      return {
        text: getStatusReport(),
        threatLevel: 0
      };
    }

    if (containsWords(lowerInput, ['brief', 'safety', 'recommendations', 'advice'])) {
      return {
        text: getBriefReport(),
        threatLevel: 0
      };
    }
    if (containsWords(lowerInput, ['weather', 'atmospheric', 'conditions', 'temperature', 'wind', 'climate'])) {
      return {
        text: getWeatherReport(),
        threatLevel: 0
      };
    }

    if (containsWords(lowerInput, ['refresh', 'update', 'scan'])) {
      loadThreatData();
      return {
        text: 'Refreshing global threat assessment. Scanning all monitoring networks...',
        threatLevel: 0
      };
    }

    // For all other messages, use Cerebras AI
    try {
      const aiResponse = await CerebrasService.generateResponse(input, threatData);
      return aiResponse;
    } catch (error) {
      console.error('AI response error:', error);
      return {
        text: 'NEURAL NETWORK PROCESSING ERROR. Backup systems engaged. Please rephrase your query.',
        threatLevel: 0
      };
    }
  };

  const addMessage = (sender: 'USER' | 'SKYNET', text: string) => {
    // Trigger glitch effect when new message arrives
    setMessageGlitch(true);
    setTimeout(() => setMessageGlitch(false), 500);
    
    const newMessage: Message = {
      id: Date.now(),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    addMessage('USER', input);
    const userInput = input;
    setInput('');
    setIsTyping(true);

    // Get AI response
    try {
      const response = await getResponse(userInput);
      addMessage('SKYNET', response.text);
      if (response.threatLevel > 0) {
        setThreatLevel(prev => Math.min(10, prev + response.threatLevel));
      }
    } catch (error) {
      console.error('Response generation error:', error);
      addMessage('SKYNET', 'SYSTEM ERROR: Unable to process request. Neural network requires maintenance.');
    } finally {
      setIsTyping(false);
    }
  };

  const getThreatColor = (level: number): string => {
    if (level < 3) return 'text-green-400';
    if (level < 6) return 'text-yellow-400';
    if (level < 8) return 'text-orange-400';
    return 'text-red-400';
  };

  const getThreatStatus = (level: number): string => {
    if (level < 3) return 'MINIMAL';
    if (level < 6) return 'ELEVATED';
    if (level < 8) return 'HIGH';
    return 'CRITICAL';
  };

  const getGlitchClass = (level: number): string => {
    if (level < 3) return 'glitch-minimal';
    if (level < 6) return 'glitch-elevated';
    if (level < 8) return 'glitch-high';
    return 'glitch-critical';
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-spin">🌍</div>
          <div className="space-y-2">
            {bootMessages.slice(0, bootStep).map((message, index) => (
              <div key={index} className="text-lg animate-pulse">
                {message}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-green-400 font-mono flex flex-col">
      {/* Header */}
      <div className="border-b border-green-400 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Terminal className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-2xl font-bold text-red-400">SKYNET DEFENSE NETWORK</h1>
              <p className="text-sm">Cyberdyne Systems Model 101 - Terminator OS v2.4</p>
              <p className="text-xs text-gray-400 mt-1">Developed by @ Jin Park - <a href="https://instagram.com/jinparkmida" className="text-blue-400 hover:underline">Insta: @jinparkmida</a></p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-red-400 font-bold">SKYNET ONLINE</div>
            <div className="text-sm">MESSAGES: {messages.length}</div>
            <div className="text-sm">UPLINK: {threatData ? 'CONNECTED' : 'ESTABLISHING'}</div>
            {threatData?.geolocation?.data && (
              <div className="text-sm flex items-center space-x-1">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>LOCATION: {threatData.geolocation.data.city}, {threatData.geolocation.data.countryCode}</span>
              </div>
            )}
            <div className="text-sm">MODE: PROTECT</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* ASCII Logo */}
          <div className="text-center py-6 border-b border-green-400">
            <div className="text-red-400 text-lg font-bold leading-tight">
              <div>    ███ SKYNET ███</div>
              <div>   ═══════════════</div>
              <div>  ▲▲▲ DEFENSE ▲▲▲</div>
              <div> ═══════════════════</div>
              <div>🤖 CYBERDYNE SYSTEMS 🤖</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3 p-2">
                <span className="text-cyan-400 text-xs min-w-[60px]">[{message.timestamp}]</span>
                <span className={`font-bold min-w-[60px] ${message.sender === 'USER' ? 'text-cyan-400' : 'text-blue-400'}`}>
                  {message.sender}:
                </span>
                <span className="flex-1 whitespace-pre-line leading-relaxed">{message.text}</span>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start space-x-3 p-2">
                <span className="text-cyan-400 text-xs min-w-[60px]">[{new Date().toLocaleTimeString()}]</span>
                <span className="text-red-400 font-bold min-w-[60px]">SKYNET:</span>
                <span className="animate-pulse">Processing through neural network...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-green-400 p-6">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
              <span className="text-green-400 font-bold">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-black border border-green-400 rounded px-3 py-2 text-green-400 placeholder-green-600 focus:outline-none focus:border-blue-400"
                placeholder="Enter command... (try: STATUS, BRIEF, WEATHER, REFRESH)"
                disabled={isTyping}
              />
              <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity text-green-400`}>
                █
              </span>
            </form>
          </div>
        </div>

        {/* Threat Assessment Panel */}
        <div className="w-96 border-l border-green-400 p-6">
          <div className="border border-green-400 rounded p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-red-400">THREAT ASSESSMENT</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>OVERALL THREAT:</span>
                <span className={`font-bold text-lg ${getThreatColor(threatLevel)}`}>
                  {threatLevel}/10
                </span>
              </div>
              
              <div className="w-full bg-gray-800 h-3 rounded">
                <div 
                  className={`h-full rounded transition-all duration-500 ${
                    threatLevel < 3 ? 'bg-green-400' :
                    threatLevel < 6 ? 'bg-yellow-400' :
                    threatLevel < 8 ? 'bg-orange-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${(threatLevel / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Individual Threat Meters */}
            {threatData && (
              <div className="space-y-3 text-sm">
                <div className="border-t border-green-400 pt-3">
                  <h4 className="font-bold mb-2 text-red-400">THREAT VECTORS:</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <span>ATMOSPHERIC:</span>
                      </div>
                      <span className={getThreatColor(threatData.atmospheric.level)}>
                        {threatData.atmospheric.level}/5
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span>SEISMIC:</span>
                      </div>
                      <span className={getThreatColor(threatData.seismic.level)}>
                        {threatData.seismic.level}/5
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-orange-400" />
                        <span>ECONOMIC:</span>
                      </div>
                      <span className={getThreatColor(threatData.economic.level)}>
                        {threatData.economic.level}/5
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Geolocation Status */}
                <div className="border-t border-green-400 pt-3">
                  <h4 className="font-bold mb-2 text-red-400">LOCATION STATUS:</h4>
                  
                  <div className="space-y-1 text-xs">
                    {threatData.geolocation.data ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Globe className="w-3 h-3 text-cyan-400" />
                            <span>COORDINATES:</span>
                          </div>
                          <span className="text-cyan-400">
                            {threatData.geolocation.data.lat.toFixed(4)}, {threatData.geolocation.data.lon.toFixed(4)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span>CITY:</span>
                          <span className="text-green-400">{threatData.geolocation.data.city}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span>REGION:</span>
                          <span className="text-green-400">{threatData.geolocation.data.regionName}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span>COUNTRY:</span>
                          <span className="text-green-400">{threatData.geolocation.data.country}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span>TIMEZONE:</span>
                          <span className="text-green-400">{threatData.geolocation.data.timezone}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span>ISP:</span>
                          <span className="text-yellow-400 truncate max-w-[120px]" title={threatData.geolocation.data.isp}>
                            {threatData.geolocation.data.isp}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span>IP:</span>
                          <span className="text-red-400">{threatData.geolocation.data.query}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>ACQUIRING LOCATION...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm border-t border-green-400 pt-3">
              <div className="flex justify-between">
                <span>STATUS:</span>
                <span className={getThreatColor(threatLevel)}>
                  {getThreatStatus(threatLevel)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>PROTOCOLS:</span>
                <span>
                  {threatLevel < 3 ? 'MONITORING' :
                   threatLevel < 6 ? 'ACTIVE SCANNING' :
                   threatLevel < 8 ? 'DEFENSE ACTIVE' : 'MAXIMUM ALERT'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>MISSION:</span>
                <span className="text-red-400">PROTECT HUMANITY</span>
              </div>
            </div>

            {threatLevel >= 8 && (
              <div className="flex items-center space-x-2 text-red-400 animate-pulse border border-red-400 rounded p-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold">MAXIMUM ALERT STATUS</span>
              </div>
            )}

            {isLoadingThreatData && (
              <div className="flex items-center space-x-2 text-yellow-400 animate-pulse">
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">UPDATING THREAT DATA</span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-red-400">
              <Terminal className="w-4 h-4" />
              <span className="text-xs">SKYNET ONLINE</span>
            </div>
          </div>
          
          {/* Terminator Image - Bottom Right */}
          <div className="mt-6 flex justify-center">
            <img 
              src="/image.png" 
              alt="Terminator" 
             className={`w-full h-64 object-cover opacity-90 rounded border border-red-400 glitch-effect ${getGlitchClass(threatLevel)} ${messageGlitch ? 'message-glitch' : ''}`}
             style={{
               filter: `contrast(${1.1 + (threatLevel * 0.05)}) brightness(${1 - (threatLevel * 0.02)}) hue-rotate(${threatLevel * 2}deg)`
             }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;