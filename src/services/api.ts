// API service for fetching real-time threat data
export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  pressure: number;
  visibility: number;
  weatherCode: number;
}

export interface EarthquakeData {
  magnitude: number;
  place: string;
  time: number;
  depth: number;
}

export interface CryptoData {
  price: number;
  change24h: number;
  volatility: number;
}

export interface GeolocationData {
  query: string; // IP address
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
}

export interface ThreatData {
  atmospheric: {
    level: number;
    data: WeatherData | null;
    status: string;
  };
  seismic: {
    level: number;
    data: EarthquakeData[];
    status: string;
  };
  economic: {
    level: number;
    data: CryptoData | null;
    status: string;
  };
  geolocation: {
    data: GeolocationData | null;
    status: string;
  };
}

class APIService {
  private static instance: APIService;
  private lastFetch: number = 0;
  private cachedData: ThreatData | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  async fetchWeatherData(lat: number = 40.7128, lon: number = -74.0060): Promise<WeatherData | null> {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,visibility,weather_code&wind_speed_unit=mph&temperature_unit=fahrenheit`
      );
      const data = await response.json();
      
      if (data.current) {
        return {
          temperature: data.current.temperature_2m || 0,
          windSpeed: data.current.wind_speed_10m || 0,
          windDirection: data.current.wind_direction_10m || 0,
          humidity: data.current.relative_humidity_2m || 0,
          pressure: data.current.surface_pressure || 0,
          visibility: data.current.visibility || 0,
          weatherCode: data.current.weather_code || 0
        };
      }
    } catch (error) {
      console.error('Weather API error:', error);
    }
    return null;
  }

  async fetchGeolocationData(): Promise<GeolocationData | null> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      if (data && !data.error) {
        return {
          query: data.ip,
          status: 'success',
          country: data.country_name,
          countryCode: data.country_code,
          region: data.region_code,
          regionName: data.region,
          city: data.city,
          zip: data.postal,
          lat: data.latitude,
          lon: data.longitude,
          timezone: data.timezone,
          isp: data.org,
          org: data.org,
          as: data.asn
        };
      }
    } catch (error) {
      console.error('Geolocation API error:', error);
    }
    return null;
  }

  async fetchEarthquakeData(): Promise<EarthquakeData[]> {
    try {
      const response = await fetch(
        'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson'
      );
      const data = await response.json();
      
      return data.features.map((feature: any) => ({
        magnitude: feature.properties.mag,
        place: feature.properties.place,
        time: feature.properties.time,
        depth: feature.geometry.coordinates[2]
      })).slice(0, 10); // Limit to 10 most recent
    } catch (error) {
      console.error('Earthquake API error:', error);
      return [];
    }
  }

  async fetchCryptoData(): Promise<CryptoData | null> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
      );
      const data = await response.json();
      
      if (data.bitcoin) {
        const change = Math.abs(data.bitcoin.usd_24h_change || 0);
        return {
          price: data.bitcoin.usd,
          change24h: data.bitcoin.usd_24h_change || 0,
          volatility: change
        };
      }
    } catch (error) {
      console.error('Crypto API error:', error);
    }
    return null;
  }

  private calculateAtmosphericThreat(weather: WeatherData | null): number {
    if (!weather) return 1;
    
    let threat = 0;
    
    // Wind speed threat
    if (weather.windSpeed > 40) threat += 3;
    else if (weather.windSpeed > 25) threat += 2;
    else if (weather.windSpeed > 15) threat += 1;
    
    // Visibility threat
    if (weather.visibility < 1000) threat += 2;
    else if (weather.visibility < 5000) threat += 1;
    
    // Pressure threat (extreme low or high)
    if (weather.pressure < 980 || weather.pressure > 1040) threat += 1;
    
    return Math.min(threat, 5);
  }

  private calculateSeismicThreat(earthquakes: EarthquakeData[]): number {
    if (earthquakes.length === 0) return 0;
    
    let threat = 0;
    earthquakes.forEach(eq => {
      if (eq.magnitude >= 7.0) threat += 3;
      else if (eq.magnitude >= 6.0) threat += 2;
      else if (eq.magnitude >= 5.0) threat += 1;
    });
    
    return Math.min(threat, 5);
  }

  private calculateEconomicThreat(crypto: CryptoData | null): number {
    if (!crypto) return 1;
    
    const volatility = crypto.volatility;
    if (volatility > 15) return 4;
    if (volatility > 10) return 3;
    if (volatility > 5) return 2;
    if (volatility > 2) return 1;
    return 0;
  }

  async fetchAllThreatData(): Promise<ThreatData> {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (this.cachedData && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cachedData;
    }

    try {
      // First fetch geolocation to get user's coordinates
      const geolocation = await this.fetchGeolocationData();
      
      // Use user's coordinates for weather if available, otherwise use default
      const lat = geolocation?.lat || 40.7128;
      const lon = geolocation?.lon || -74.0060;
      
      const [weather, earthquakes, crypto] = await Promise.all([
        this.fetchWeatherData(lat, lon),
        this.fetchEarthquakeData(),
        this.fetchCryptoData()
      ]);

      const threatData: ThreatData = {
        atmospheric: {
          level: this.calculateAtmosphericThreat(weather),
          data: weather,
          status: this.getAtmosphericStatus(weather)
        },
        seismic: {
          level: this.calculateSeismicThreat(earthquakes),
          data: earthquakes,
          status: this.getSeismicStatus(earthquakes)
        },
        economic: {
          level: this.calculateEconomicThreat(crypto),
          data: crypto,
          status: this.getEconomicStatus(crypto)
        },
        geolocation: {
          data: geolocation,
          status: this.getGeolocationStatus(geolocation)
        }
      };

      this.cachedData = threatData;
      this.lastFetch = now;
      return threatData;
    } catch (error) {
      console.error('Error fetching threat data:', error);
      // Return default threat data on error
      return {
        atmospheric: { level: 1, data: null, status: 'MONITORING' },
        seismic: { level: 0, data: [], status: 'STABLE' },
        economic: { level: 1, data: null, status: 'VOLATILE' },
        geolocation: { data: null, status: 'OFFLINE' }
      };
    }
  }

  private getAtmosphericStatus(weather: WeatherData | null): string {
    if (!weather) return 'OFFLINE';
    if (weather.windSpeed > 40) return 'SEVERE WINDS';
    if (weather.windSpeed > 25) return 'HIGH WINDS';
    if (weather.visibility < 1000) return 'LOW VISIBILITY';
    return 'STABLE';
  }

  private getSeismicStatus(earthquakes: EarthquakeData[]): string {
    if (earthquakes.length === 0) return 'QUIET';
    const maxMag = Math.max(...earthquakes.map(eq => eq.magnitude));
    if (maxMag >= 7.0) return 'MAJOR ACTIVITY';
    if (maxMag >= 6.0) return 'SIGNIFICANT ACTIVITY';
    return 'MINOR ACTIVITY';
  }

  private getEconomicStatus(crypto: CryptoData | null): string {
    if (!crypto) return 'OFFLINE';
    if (crypto.volatility > 15) return 'EXTREME VOLATILITY';
    if (crypto.volatility > 10) return 'HIGH VOLATILITY';
    if (crypto.volatility > 5) return 'MODERATE VOLATILITY';
    return 'STABLE';
  }

  private getGeolocationStatus(geolocation: GeolocationData | null): string {
    if (!geolocation) return 'OFFLINE';
    if (geolocation.status === 'success') return 'LOCKED';
    return 'SEARCHING';
  }
}

export default APIService.getInstance();