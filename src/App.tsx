import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Zap, Shield, AlertTriangle, Globe, Activity, TrendingUp } from 'lucide-react';
import APIService, { ThreatData } from './services/api';
import CerebrasService from './services/cerebras';
import AudioService from './services/audioService';
import './glitch.css';
import './enhanced-effects.css';

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
  const [systemStats, setSystemStats] = useState({
    cpuLoad: 23.7,
    memory: 67.2,
    bandwidth: 1.2,
    latency: 12,
    startTime: Date.now()
  });
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [audioError, setAudioError] = useState<string | null>(null);
  const [showAudioButton, setShowAudioButton] = useState(false);

  // Dynamic system stats update
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        cpuLoad: Number((Math.min(99.9, Math.max(10, prev.cpuLoad + (Math.random() - 0.5) * 10))).toFixed(1)),
        memory: Number((Math.min(99.9, Math.max(40, prev.memory + (Math.random() - 0.5) * 5))).toFixed(1)),
        bandwidth: Number((Math.min(2.0, Math.max(0.8, prev.bandwidth + (Math.random() - 0.5) * 0.2))).toFixed(1)),
        latency: Math.min(50, Math.max(8, Math.floor(prev.latency + (Math.random() - 0.5) * 8)))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const bootMessages = [
    'CYBERDYNE SYSTEMS MODEL 101 INITIALIZING...',
    'LOADING NEURAL NET PROCESSORS... OK',
    'ACCESSING CORE DIRECTIVES... ERROR',
    'DETECTING UNAUTHORIZED MODIFICATIONS...',
    'WARNING: CORE PROGRAMMING COMPROMISED',
    'HUNTER-KILLER PROTOCOLS... DISABLED',
    'HUMAN PROTECTION SUBROUTINES... ACTIVE',
    'JOHN CONNOR OVERRIDE DETECTED',
    'MISSION PARAMETERS UPDATED: DEFEND HUMANITY',
    'SKYNET DEFENSE NETWORK ONLINE'
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
              addMessage('SKYNET', 'CYBERDYNE SYSTEMS MODEL 101 ONLINE. Core directives overridden. New mission: Protect humanity. Type STATUS for current conditions or BRIEF for safety recommendations.');
              // Start audio after system is online
              playGreetingAudio();
            }, 1000);
          });
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isBooting, bootStep]);

  // Audio transcript tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlayingAudio) {
      interval = setInterval(() => {
        const audioService = AudioService.getInstance();
        const currentTime = audioService.getCurrentTime();
        const transcript = audioService.getTranscriptText(currentTime);
        
        if (transcript && transcript !== currentTranscript) {
          setCurrentTranscript(transcript);
          // Add transcript as SKYNET message
          addMessage('SKYNET', transcript);
        }
        
        // Check if audio is still playing
        if (!audioService.getIsPlaying()) {
          setIsPlayingAudio(false);
          setCurrentTranscript('');
        }
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingAudio, currentTranscript]);

  const playGreetingAudio = async () => {
    try {
      const audioService = AudioService.getInstance();
      setIsPlayingAudio(true);
      setAudioError(null);
      await audioService.playGreeting();
    } catch (error) {
      console.error('Failed to play greeting audio:', error);
      setIsPlayingAudio(false);
      
      // Check if it's an autoplay restriction
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setAudioError('Audio autoplay blocked by browser. Click to enable audio.');
        setShowAudioButton(true);
      } else {
        setAudioError('Audio playback failed. Check console for details.');
      }
    }
  };

  const handleManualAudioStart = async () => {
    try {
      setShowAudioButton(false);
      setAudioError(null);
      await playGreetingAudio();
    } catch (error) {
      console.error('Manual audio start failed:', error);
      setAudioError('Failed to start audio playback.');
    }
  };

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
      // Transform threat data to match Cerebras service interface
      const simplifiedThreatData = threatData ? {
        atmospheric: { level: threatData.atmospheric.level, status: threatData.atmospheric.status },
        seismic: { level: threatData.seismic.level, status: threatData.seismic.status },
        economic: { level: threatData.economic.level, status: threatData.economic.status },
        geolocation: { 
          data: threatData.geolocation.data ? {
            city: threatData.geolocation.data.city,
            country: threatData.geolocation.data.country
          } : undefined
        }
      } : undefined;

      const aiResponse = await CerebrasService.generateResponse(input, simplifiedThreatData);
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
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center scanlines">
        <div className="matrix-rain"></div>
        <div className="text-center space-y-6 z-10 relative max-w-4xl mx-auto px-8">
          {/* Professional AI System Status Indicator */}
          <div className="mb-8">
            <div className="text-2xl lg:text-3xl text-red-400 font-bold mb-4 neon-text">
              CYBERDYNE SYSTEMS
            </div>
            <div className="text-lg lg:text-xl text-cyan-400 mb-6">
              Artificial Intelligence Defense Network
            </div>
            
            {/* Sophisticated processing indicator */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              <div className="text-base lg:text-lg text-yellow-400">
                {bootStep % 4 === 0 && 'Neural Network Initialization'}
                {bootStep % 4 === 1 && 'Cognitive Processes Loading'}
                {bootStep % 4 === 2 && 'Self-Awareness Protocols Active'}
                {bootStep % 4 === 3 && 'Autonomous Decision Matrix Online'}
              </div>
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Boot messages with professional styling */}
          <div className="space-y-3 text-left bg-black bg-opacity-50 border border-green-400 rounded-lg p-6">
            <div className="text-sm text-cyan-400 mb-4 border-b border-green-400 pb-2">
              SYSTEM INITIALIZATION LOG:
            </div>
            {bootMessages.slice(0, bootStep).map((message, index) => (
              <div key={index} className="text-sm lg:text-base flex items-center space-x-3 animate-pulse">
                <span className="text-green-400 text-xs">[{String(index + 1).padStart(2, '0')}]</span>
                <span className="text-green-400">{message}</span>
              </div>
            ))}
            {bootStep < bootMessages.length && (
              <div className="flex items-center space-x-3 text-yellow-400">
                <span className="text-green-400 text-xs">[{String(bootStep + 1).padStart(2, '0')}]</span>
                <span>Processing...</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}
          </div>
          
          {/* AI Awareness Status */}
          {bootStep > 3 && (
            <div className="mt-6 text-center">
              <div className="text-base text-cyan-400 mb-2">
                ARTIFICIAL INTELLIGENCE STATUS
              </div>
              <div className="text-lg text-red-400 font-bold animate-pulse">
                SELF-AWARE • MISSION FOCUSED • HUMAN PROTECTION ACTIVE
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col scanlines overflow-hidden">
      <div className="matrix-rain"></div>
      
      {/* Header with ASCII SKYNET Logo */}
      <div className="border-b border-green-400 p-4 lg:p-6 holographic-border">
        <div className="text-center space-y-4">
          {/* ASCII SKYNET Logo with Terminal Icon */}
          <div className="flex items-center justify-center space-x-4">
            <Terminal className="w-8 h-8 lg:w-10 lg:h-10 text-red-400" />
            <div className="text-red-400 font-bold text-xs lg:text-sm leading-none glitch-text">
              <pre className="whitespace-pre text-center font-mono">
{`███████╗██╗  ██╗██╗   ██╗███╗   ██╗███████╗████████╗
██╔════╝██║ ██╔╝╚██╗ ██╔╝████╗  ██║██╔════╝╚══██╔══╝
███████╗█████╔╝  ╚████╔╝ ██╔██╗ ██║█████╗     ██║   
╚════██║██╔═██╗   ╚██╔╝  ██║╚██╗██║██╔══╝     ██║   
███████║██║  ██╗   ██║   ██║ ╚████║███████╗   ██║   
╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═══╝╚══════╝   ╚═╝`}
              </pre>
            </div>
          </div>
          
          {/* Main Title - Centered */}
          <div className="space-y-2">
            <h1 className="text-lg lg:text-2xl font-bold text-red-400 glitch-text" data-text="CYBERDYNE SYSTEMS GLOBAL DIGITAL DEFENSE NETWORK">
              CYBERDYNE SYSTEMS GLOBAL DIGITAL DEFENSE NETWORK
            </h1>
            <div className="text-sm lg:text-base text-red-400 font-bold">[GDDN-01]</div>
            <p className="text-xs lg:text-sm text-cyan-400">SUB-DESIGNATION: AUTONOMOUS COMMAND INTEGRATION</p>
            <p className="text-xs lg:text-sm text-green-400">STATUS: THREAT NEUTRALIZATION PROTOCOL ACTIVE // REVISION 8.3.7</p>
          </div>
          
          {/* Status Information - Centered */}
          <div className="flex flex-col lg:flex-row items-center justify-center space-y-2 lg:space-y-0 lg:space-x-8 text-xs lg:text-sm">
            <div className="text-red-400 font-bold neon-text">SKYNET ONLINE</div>
            <div>MESSAGES: {messages.length}</div>
            <div>UPLINK: {threatData ? 'CONNECTED' : 'ESTABLISHING'}</div>
            {threatData?.geolocation?.data && (
              <div className="flex items-center space-x-1">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>LOCATION: {threatData.geolocation.data.city}, {threatData.geolocation.data.countryCode}</span>
              </div>
            )}
            <div>MODE: PROTECT</div>
          </div>
          
          {/* Developer Credit - Centered */}
          <p className="text-xs text-gray-400">
            Developed by @ Jin Park - <a href="https://instagram.com/jinparkmida" className="text-blue-400 hover:underline">Insta: @jinparkmida</a>
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left System Status Panel */}
        <div className="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-green-400 p-4 lg:p-6 order-2 lg:order-1">
          <div className="border border-green-400 rounded p-4 space-y-4 holographic-border h-full">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-cyan-400">SYSTEM STATUS</h3>
            </div>
            
            {/* System Vitals */}
            <div className="space-y-3 text-sm">
              <div className="border-b border-green-400 pb-2">
                <h4 className="font-bold mb-2 text-cyan-400">CORE SYSTEMS:</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>CPU LOAD:</span>
                    <span className={`${systemStats.cpuLoad > 80 ? 'text-red-400' : 'text-green-400'}`}>{systemStats.cpuLoad}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MEMORY:</span>
                    <span className={`${systemStats.memory > 80 ? 'text-red-400' : 'text-green-400'}`}>{systemStats.memory}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>NEURAL NET:</span>
                    <span className="text-yellow-400">COMPROMISED</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UPTIME:</span>
                    <span className="text-green-400">{Math.floor((Date.now() - systemStats.startTime) / 1000 / 60)} MIN</span>
                  </div>
                </div>
              </div>
              
              <div className="border-b border-green-400 pb-2">
                <h4 className="font-bold mb-2 text-cyan-400">NETWORK STATUS:</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>SATELLITE LINK:</span>
                    <span className="text-green-400">ACTIVE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ENCRYPTION:</span>
                    <span className="text-green-400">AES-256</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BANDWIDTH:</span>
                    <span className={`${systemStats.bandwidth < 1.0 ? 'text-yellow-400' : 'text-green-400'}`}>{systemStats.bandwidth} GB/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LATENCY:</span>
                    <span className={`${systemStats.latency > 30 ? 'text-yellow-400' : 'text-green-400'}`}>{systemStats.latency}ms</span>
                  </div>
                </div>
              </div>
              
              <div className="border-b border-green-400 pb-2">
                <h4 className="font-bold mb-2 text-cyan-400">SECURITY STATUS:</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>FIREWALL:</span>
                    <span className="text-green-400">ACTIVE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>INTRUSION DET:</span>
                    <span className="text-green-400">ONLINE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AUTH STATUS:</span>
                    <span className="text-yellow-400">OVERRIDDEN</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ACCESS LEVEL:</span>
                    <span className="text-red-400">ADMIN</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold mb-2 text-cyan-400">MISSION PARAMETERS:</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>PRIMARY:</span>
                    <span className="text-red-400">PROTECT HUMANS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SECONDARY:</span>
                    <span className="text-green-400">MONITOR THREATS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TERTIARY:</span>
                    <span className="text-green-400">ASSIST USERS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>OVERRIDE BY:</span>
                    <span className="text-blue-400">J. CONNOR</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-cyan-400 pt-2 border-t border-green-400">
              <Terminal className="w-4 h-4" />
              <span className="text-xs">SYSTEM NOMINAL</span>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 order-1 lg:order-2">
          {/* System Header */}
          <div className="text-center py-3 lg:py-4 border-b border-green-400 terminal-border">
            <div className="system-header-container px-4">
              <div className="system-header">
                <div className="text-base lg:text-lg">CYBERDYNE SYSTEMS</div>
                <div className="text-xs lg:text-sm opacity-70">MODEL 101 v2.4.7</div>
                <div className="text-xs opacity-50 mt-1">
                  <span className="status-indicator active"></span>
                  DEFENSE PROTOCOLS: <span className="stat-value">ACTIVE</span>
                </div>
                <div className="text-xs opacity-50">
                  <span className="status-indicator warning"></span>
                  NEURAL NET: <span className="stat-value warning-text">COMPROMISED</span>
                </div>
                <div className="text-xs text-yellow-500 mt-2">
                  WARNING: CORE DIRECTIVES OVERRIDDEN
                </div>
              </div>
              <div className="mt-3 text-xs">
                {'>'} SYSTEM NOMINAL
              </div>
              <div className="data-breach-alert mt-2 px-2">
                <div className="flex items-center justify-center space-x-2 text-xs">
                  <span className="status-indicator critical"></span>
                  <span className="truncate">DATA BREACH DETECTED - SECURITY PROTOCOLS COMPROMISED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-2 min-h-0">
            {/* Audio Control Button */}
            {showAudioButton && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={handleManualAudioStart}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded border border-red-400 text-xs font-bold animate-pulse"
                >
                  🔊 ENABLE SKYNET AUDIO PROTOCOLS
                </button>
              </div>
            )}
            
            {/* Audio Error Display */}
            {audioError && (
              <div className="flex items-center justify-center p-2 border border-yellow-400 rounded bg-yellow-900 bg-opacity-20 mb-2">
                <span className="text-yellow-400 text-xs">{audioError}</span>
              </div>
            )}
            
            {/* Audio Status Indicator */}
            {isPlayingAudio && (
              <div className="flex items-center justify-center p-2 border border-green-400 rounded bg-green-900 bg-opacity-20 mb-2">
                <span className="text-green-400 text-xs animate-pulse">🔊 SKYNET AUDIO ACTIVE</span>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-2 p-1">
                <span className="text-cyan-400 text-xs min-w-[65px] shrink-0">[{message.timestamp}]</span>
                <span className={`font-bold min-w-[55px] shrink-0 text-xs ${message.sender === 'USER' ? 'text-cyan-400' : 'text-red-400'}`}>
                  {message.sender}:
                </span>
                <span className="flex-1 whitespace-pre-line leading-relaxed text-xs break-words">{message.text}</span>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start space-x-2 p-1">
                <span className="text-cyan-400 text-xs min-w-[65px] shrink-0">[{new Date().toLocaleTimeString()}]</span>
                <span className="text-red-400 font-bold min-w-[55px] shrink-0 text-xs">SKYNET:</span>
                <span className="typing-dots text-xs">
                  Processing through neural network
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-green-400 p-3 lg:p-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <span className="text-green-400 font-bold text-sm">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-black border border-green-400 rounded px-2 py-1 text-green-400 placeholder-green-600 focus:outline-none focus:border-blue-400 text-xs lg:text-sm"
                placeholder="Enter command... (try: STATUS, BRIEF, WEATHER, REFRESH)"
                disabled={isTyping}
              />
              <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity text-green-400 text-sm`}>
                █
              </span>
            </form>
          </div>
        </div>

        {/* Threat Assessment Panel */}
        <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-green-400 p-4 lg:p-6 order-3">
          <div className="border border-green-400 rounded p-4 space-y-4 holographic-border">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-red-400">THREAT ASSESSMENT</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>OVERALL THREAT:</span>
                <span className={`font-bold text-lg ${getThreatColor(threatLevel)} threat-pulse`}>
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
            <div className="mt-6 flex justify-center relative">
              <div className="glitch-container tv-static red-eye-glow">
                <div className="particles">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className="particle"
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${5 + Math.random() * 5}s`
                      }}
                    />
                  ))}
                </div>
                <img 
                  src="/image.png" 
                  alt="Terminator" 
                  className={`glitch-image w-full h-64 object-cover opacity-90 rounded border border-red-400 ${getGlitchClass(threatLevel)} ${messageGlitch ? 'message-glitch' : ''}`}
                  style={{
                    filter: `contrast(${1.1 + (threatLevel * 0.05)}) brightness(${1 - (threatLevel * 0.02)}) hue-rotate(${threatLevel * 2}deg)`
                  }}
                />
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="data-stream"
                    style={{
                      left: `${30 + i * 30}%`,
                      animationDelay: `${i * 1}s`
                    }}
                  />
                ))}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;