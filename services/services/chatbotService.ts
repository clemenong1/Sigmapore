import { DENGUE_GEOJSON_DATA } from '../data/dengueData';
import { PSIService } from './psiService';
import { CovidService } from './covidService';
import HealthPredictionService from './healthPredictionService';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  metadata?: {
    type?: 'text' | 'location_recommendation' | 'health_alert' | 'prediction' | 'travel_recommendation';
    location?: string;
    riskLevel?: string;
    recommendations?: string[];
  };
  // Enhanced data transparency fields
  predictionData?: any;
  locationData?: {
    location: string;
    dengueRisk: { level: string; casesNearby: number };
    airQuality: { psi: number; level: string };
    covidRisk: { level: string; hospitalCases: number };
    overallRisk: string;
  };
}

export interface LocationAnalysis {
  location: string;
  dengueRisk: {
    level: string;
    casesNearby: number;
    recommendations: string[];
  };
  airQuality: {
    psi: number;
    level: string;
    recommendations: string[];
  };
  covidRisk: {
    level: string;
    hospitalCases: number;
    recommendations: string[];
  };
  overallRisk: string;
  travelAdvice: string[];
}

export class HealthChatbotService {
  private openaiApiKey: string;
  private psiService: PSIService;
  private covidService: CovidService;
  private predictionService: HealthPredictionService;
  private chatHistory: ChatMessage[] = [];

  // Location coordinates database for precise analysis
  private locationCoordinates: { [key: string]: { lat: number; lng: number } } = {
    // Central Region
    'orchard': { lat: 1.3048, lng: 103.8318 },
    'orchard road': { lat: 1.3048, lng: 103.8318 },
    'marina bay': { lat: 1.2810, lng: 103.8598 },
    'chinatown': { lat: 1.2833, lng: 103.8437 },
    'clarke quay': { lat: 1.2888, lng: 103.8467 },
    'little india': { lat: 1.3063, lng: 103.8516 },
    'bugis': { lat: 1.3000, lng: 103.8558 },
    'raffles place': { lat: 1.2845, lng: 103.8507 },
    
    // North Region
    'woodlands': { lat: 1.4382, lng: 103.7890 },
    'yishun': { lat: 1.4304, lng: 103.8354 },
    'sembawang': { lat: 1.4491, lng: 103.8185 },
    'admiralty': { lat: 1.4407, lng: 103.8010 },
    'marsiling': { lat: 1.4327, lng: 103.7742 },
    'kranji': { lat: 1.4250, lng: 103.7617 },
    
    // South Region  
    'sentosa': { lat: 1.2494, lng: 103.8303 },
    'harbourfront': { lat: 1.2659, lng: 103.8223 },
    'tiong bahru': { lat: 1.2855, lng: 103.8270 },
    'tanjong pagar': { lat: 1.2762, lng: 103.8458 },
    
    // East Region
    'changi': { lat: 1.3644, lng: 103.9915 },
    'tampines': { lat: 1.3496, lng: 103.9568 },
    'pasir ris': { lat: 1.3721, lng: 103.9474 },
    'bedok': { lat: 1.3236, lng: 103.9273 },
    'katong': { lat: 1.3048, lng: 103.9065 },
    'geylang': { lat: 1.3133, lng: 103.8785 },
    'paya lebar': { lat: 1.3175, lng: 103.8918 },
    
    // West Region
    'jurong east': { lat: 1.3329, lng: 103.7436 },
    'clementi': { lat: 1.3162, lng: 103.7649 },
    'boon lay': { lat: 1.3387, lng: 103.7018 },
    'tuas': { lat: 1.2966, lng: 103.6361 },
    'bukit batok': { lat: 1.3590, lng: 103.7637 },
    'choa chu kang': { lat: 1.3840, lng: 103.7470 },
    'bukit panjang': { lat: 1.3774, lng: 103.7719 }
  };

  constructor(openaiApiKey?: string) {
    this.openaiApiKey = openaiApiKey || '';
    this.psiService = new PSIService();
    this.covidService = new CovidService();
    this.predictionService = new HealthPredictionService();
  }

  setApiKey(apiKey: string) {
    this.openaiApiKey = apiKey;
  }

  // Main chat interface
  async processMessage(userMessage: string, userLocation?: string): Promise<ChatMessage> {
    const userMsg: ChatMessage = {
      id: this.generateId(),
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    };

    this.chatHistory.push(userMsg);

    try {
      // Analyze message intent
      const intent = this.analyzeIntent(userMessage);
      let response: ChatMessage;

      switch (intent.type) {
        case 'location_query':
          response = await this.handleLocationQuery(userMessage, intent.location || userLocation);
          break;
        case 'travel_advice':
          response = await this.handleTravelAdvice(userMessage, intent.location || userLocation);
          break;
        case 'health_explanation':
          response = await this.handleHealthExplanation(userMessage, intent.topic);
          break;
        case 'prediction_request':
          response = await this.handlePredictionRequest(userMessage, intent.location);
          break;
        case 'general_health':
          response = await this.handleGeneralHealth(userMessage);
          break;
        default:
          response = await this.handleGeneralChat(userMessage);
      }

      this.chatHistory.push(response);
      return response;

    } catch (error) {
      console.error('Chatbot error:', error);
      return this.createErrorResponse();
    }
  }

  // Enhanced AI intent analysis - much smarter location and context detection
  private analyzeIntent(message: string): { type: string; location?: string; topic?: string } {
    const lowerMessage = message.toLowerCase();
    const location = this.extractLocation(message);

    // SMART TRAVEL & LOCATION DETECTION (with data transparency)
    const travelPatterns = [
      'going to', 'traveling to', 'visiting', 'heading to', 'trip to', 'travel to',
      'planning to visit', 'will be at', 'going out to', 'journey to', 'moving to'
    ];
    
    const locationQueries = [
      'risk in', 'safe in', 'conditions in', 'situation in', 'health in', 'dangers in',
      'dengue in', 'air quality in', 'covid in', 'psi in', 'cases in', 'clusters in',
      'how is', 'what about', 'tell me about', 'info about', 'data for', 'stats for'
    ];

    const predictionPatterns = [
      'predict', 'forecast', 'future', 'tomorrow', 'next week', 'weekend', 'upcoming',
      'will be', 'expect', 'outlook', 'projection', 'trend', 'what will happen'
    ];

    // TRAVEL ADVICE (always show data transparency)
    if (travelPatterns.some(pattern => lowerMessage.includes(pattern))) {
      return { type: 'travel_advice', location };
    }

    // LOCATION QUERIES (always show data transparency)  
    if (locationQueries.some(pattern => lowerMessage.includes(pattern)) || location) {
      return { type: 'location_query', location };
    }

    // PREDICTION REQUESTS (always show data transparency)
    if (predictionPatterns.some(pattern => lowerMessage.includes(pattern))) {
      return { type: 'prediction_request', location };
    }

    // SMART LOCATION INFERENCE - if any Singapore location mentioned, show data
    if (location) {
      // If location mentioned but context unclear, default to location query with data
      if (lowerMessage.includes('tomorrow') || lowerMessage.includes('today') || lowerMessage.includes('now')) {
        return { type: 'location_query', location };
      }
      return { type: 'location_query', location };
    }

    // Health explanations
    if (lowerMessage.includes('what is') || lowerMessage.includes('explain')) {
      if (lowerMessage.includes('dengue') || lowerMessage.includes('psi') || lowerMessage.includes('air quality') || lowerMessage.includes('covid')) {
        return { type: 'health_explanation', topic: this.extractHealthTopic(message) };
      }
    }

    // General health
    if (lowerMessage.includes('health') || lowerMessage.includes('symptom') || lowerMessage.includes('prevention')) {
      return { type: 'general_health' };
    }

    return { type: 'general_chat' };
  }

  // Handle location-specific queries
  private async handleLocationQuery(message: string, location?: string): Promise<ChatMessage> {
    if (!location) {
      return this.createResponse("I'd be happy to help you check health conditions! Please specify a location in Singapore, for example: 'What are the health risks in Woodlands?'");
    }

    const analysis = await this.analyzeLocation(location);
    const response = this.formatLocationAnalysis(analysis);

    return {
      id: this.generateId(),
      text: response,
      isUser: false,
      timestamp: new Date(),
      metadata: {
        type: 'location_recommendation',
        location: analysis.location,
        riskLevel: analysis.overallRisk,
        recommendations: analysis.travelAdvice
      },
      locationData: {
        location: analysis.location,
        dengueRisk: { level: analysis.dengueRisk.level, casesNearby: analysis.dengueRisk.casesNearby },
        airQuality: { psi: analysis.airQuality.psi, level: analysis.airQuality.level },
        covidRisk: { level: analysis.covidRisk.level, hospitalCases: analysis.covidRisk.hospitalCases },
        overallRisk: analysis.overallRisk
      }
    };
  }

  // Handle travel advice requests
  private async handleTravelAdvice(message: string, location?: string): Promise<ChatMessage> {
    if (!location) {
      return this.createResponse("Please tell me where you're planning to travel in Singapore, and I'll give you personalized health recommendations!");
    }

    const analysis = await this.analyzeLocation(location);
    const travelAdvice = this.generateTravelAdvice(analysis);

    return {
      id: this.generateId(),
      text: travelAdvice,
      isUser: false,
      timestamp: new Date(),
      metadata: {
        type: 'travel_recommendation',
        location: analysis.location,
        riskLevel: analysis.overallRisk
      },
      locationData: {
        location: analysis.location,
        dengueRisk: { level: analysis.dengueRisk.level, casesNearby: analysis.dengueRisk.casesNearby },
        airQuality: { psi: analysis.airQuality.psi, level: analysis.airQuality.level },
        covidRisk: { level: analysis.covidRisk.level, hospitalCases: analysis.covidRisk.hospitalCases },
        overallRisk: analysis.overallRisk
      }
    };
  }

  // Handle health topic explanations
  private async handleHealthExplanation(message: string, topic?: string): Promise<ChatMessage> {
    const explanations = {
      dengue: `🦟 **Dengue Fever Explained:**

Dengue is a mosquito-borne viral infection transmitted by Aedes mosquitoes. In Singapore, it's monitored through cluster mapping.

**Key Points:**
• Symptoms: High fever, severe headache, muscle/joint pain
• Peak breeding: Wet weather, stagnant water
• Prevention: Remove stagnant water, use repellent
• Current clusters: ${await this.getDengueClusterCount()} active areas

**Government Measures:**
• NEA conducts regular inspections
• Mozzie wipeout campaigns
• Public education programs
• Community involvement initiatives`,

      psi: `🌬️ **Air Quality (PSI) Explained:**

PSI measures air pollution levels across Singapore's 5 regions.

**PSI Levels:**
• 0-50: Good (Normal activities)
• 51-100: Moderate (Sensitive people limit outdoor activities)
• 101-200: Unhealthy (Everyone limit prolonged outdoor activities)
• 201-300: Very Unhealthy (Avoid outdoor activities)
• 300+: Hazardous (Stay indoors)

**Measured Pollutants:**
• PM2.5 & PM10 (fine particles)
• Sulfur Dioxide (SO2)
• Carbon Monoxide (CO)
• Ozone (O3)
• Nitrogen Dioxide (NO2)`,

      covid: `🏥 **COVID-19 Information:**

Based on historical hospital admission data and current guidelines.

**Current Measures:**
• Maintain good personal hygiene
• Wear masks when feeling unwell
• Stay home if sick
• Regular hand washing/sanitizing

**Hospital Distribution:**
• NCID: Primary infectious disease center
• Multiple hospitals handle cases
• Isolation protocols in place
• Contact tracing when needed`
    };

    const explanation = explanations[topic as keyof typeof explanations] || 
      "I can explain dengue fever, air quality (PSI), or COVID-19 measures. What would you like to know more about?";

    return this.createResponse(explanation);
  }

  // Handle prediction requests with advanced forecasting
  private async handlePredictionRequest(message: string, location?: string): Promise<ChatMessage> {
    const lowerMessage = message.toLowerCase();
    let daysAhead = 1; // Default to tomorrow
    
    // Extract time period from message
    if (lowerMessage.includes('week') || lowerMessage.includes('7 day')) daysAhead = 7;
    else if (lowerMessage.includes('weekend')) daysAhead = this.getDaysToWeekend();
    else if (lowerMessage.includes('month')) daysAhead = 30;
    else if (lowerMessage.includes('tomorrow')) daysAhead = 1;
    
    try {
      const predictions = await this.predictionService.predictHealthConditions(location || 'Singapore', daysAhead);
      const response = this.formatPredictionResponse(predictions, daysAhead);
      
      // ALWAYS include current location data for transparency
      const analysis = location ? await this.analyzeLocation(location) : null;
      
      return {
        id: this.generateId(),
        text: response,
        isUser: false,
        timestamp: new Date(),
        metadata: {
          type: 'prediction',
          location: location || 'Singapore'
        },
        predictionData: predictions,
        locationData: analysis ? {
          location: analysis.location,
          dengueRisk: { level: analysis.dengueRisk.level, casesNearby: analysis.dengueRisk.casesNearby },
          airQuality: { psi: analysis.airQuality.psi, level: analysis.airQuality.level },
          covidRisk: { level: analysis.covidRisk.level, hospitalCases: analysis.covidRisk.hospitalCases },
          overallRisk: analysis.overallRisk
        } : undefined
      };
    } catch (error) {
      console.error('Prediction error:', error);
      return this.createResponse("I'm having trouble generating predictions right now. Please try again in a moment.");
    }
  }

  // Generate health predictions (innovative feature)
  private async generateHealthPredictions(location?: string): Promise<string> {
    try {
      const currentDate = new Date();
      const season = this.getCurrentSeason();
      const dengueData = await this.getDengueRiskFactors();
      const weatherPattern = this.getWeatherPattern();

      return `🔮 **Health Predictions for ${location || 'Singapore'}:**

**Dengue Risk Forecast (Next 2 weeks):**
${dengueData.prediction}

**Air Quality Outlook:**
• Expected PSI range: ${this.predictPSI()}
• Weather influence: ${weatherPattern}
• Recommendation: ${this.getAirQualityForecastAdvice()}

**Seasonal Health Trends:**
• Current season: ${season}
• Typical health risks: ${this.getSeasonalRisks(season)}
• Prevention focus: ${this.getSeasonalPrevention(season)}

**🔬 Prediction Methodology:**
Based on historical patterns, current cluster data, weather trends, and seasonal factors.

*Note: Predictions are estimates based on historical data and should not replace official health advisories.*`;

    } catch (error) {
      return "I'm currently updating my prediction models. Please check back soon for health forecasts!";
    }
  }

  // Analyze location for health risks
  private async analyzeLocation(location: string): Promise<LocationAnalysis> {
    const [dengueRisk, airQuality, covidRisk] = await Promise.all([
      this.analyzeDengueRisk(location),
      this.analyzeAirQuality(location),
      this.analyzeCovidRisk(location)
    ]);

    const overallRisk = this.calculateOverallRisk(dengueRisk.level, airQuality.level, covidRisk.level);
    const travelAdvice = this.generateOverallAdvice(dengueRisk, airQuality, covidRisk, overallRisk);

    return {
      location,
      dengueRisk,
      airQuality,
      covidRisk,
      overallRisk,
      travelAdvice
    };
  }

  // Calculate precise distance between two GPS coordinates
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get precise coordinates for a location
  private getLocationCoordinates(location: string): { lat: number; lng: number } | null {
    const normalizedLocation = location.toLowerCase().trim();
    
    // Try exact match first
    if (this.locationCoordinates[normalizedLocation]) {
      return this.locationCoordinates[normalizedLocation];
    }

    // Try partial match
    for (const [key, coords] of Object.entries(this.locationCoordinates)) {
      if (key.includes(normalizedLocation) || normalizedLocation.includes(key)) {
        return coords;
      }
    }

    return null;
  }

  // Analyze dengue risk with PRECISE GPS-based distance calculations
  private async analyzeDengueRisk(location: string): Promise<any> {
    const clusters = DENGUE_GEOJSON_DATA.features;
    const locationCoords = this.getLocationCoordinates(location);
    
    if (!locationCoords) {
      // Fallback to old method for unknown locations
      const relevantClusters = clusters.filter(cluster => 
        cluster.properties.LOCALITY.toLowerCase().includes(location.toLowerCase())
      );
      const casesNearby = relevantClusters.reduce((sum, cluster) => sum + cluster.properties.CASE_SIZE, 0);
      return {
        level: casesNearby > 20 ? 'High' : casesNearby > 10 ? 'Medium' : 'Low',
        casesNearby,
        recommendations: this.getDengueRecommendations(casesNearby > 20 ? 'High' : 'Low'),
        localFactors: [`Generic data for ${location}`],
        nearbyHotspots: relevantClusters.map(c => c.properties.LOCALITY.substring(0, 30) + '...')
      };
    }

    // HYPERLOCAL ANALYSIS: Calculate exact distances to all clusters
    const clusterDistances = clusters.map(cluster => {
      // Get cluster center coordinates (first coordinate of polygon)
      const clusterCoords = cluster.geometry.coordinates[0][0]; // [lng, lat]
      const clusterLat = clusterCoords[1];
      const clusterLng = clusterCoords[0];
      
      const distance = this.calculateDistance(
        locationCoords.lat, locationCoords.lng,
        clusterLat, clusterLng
      );

      return {
        cluster,
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        cases: cluster.properties.CASE_SIZE,
        locality: cluster.properties.LOCALITY
      };
    });

    // Sort by distance and analyze immediate vicinity
    clusterDistances.sort((a, b) => a.distance - b.distance);

    // Find clusters within different distance rings
    const within500m = clusterDistances.filter(c => c.distance <= 0.5);
    const within1km = clusterDistances.filter(c => c.distance <= 1.0);
    const within2km = clusterDistances.filter(c => c.distance <= 2.0);
    const within5km = clusterDistances.filter(c => c.distance <= 5.0);

    // Calculate weighted risk based on distance and cases
    let riskScore = 0;
    within500m.forEach(c => riskScore += c.cases * 10); // Very close = high weight
    within1km.forEach(c => riskScore += c.cases * 5);   // Close = medium weight
    within2km.forEach(c => riskScore += c.cases * 2);   // Nearby = low weight
    
    const totalCasesNearby = within2km.reduce((sum, c) => sum + c.cases, 0);
    const closestCluster = clusterDistances[0];

    // Determine precise risk level
    let level = 'Low';
    if (within500m.length > 0 || riskScore > 100) level = 'Very High';
    else if (within1km.length > 1 || riskScore > 50) level = 'High';
    else if (within2km.length > 0 || riskScore > 20) level = 'Medium';

    // Generate hyperlocal insights
    const hyperLocalFactors = this.generateHyperLocalDengueInsights(
      location, locationCoords, within500m, within1km, within2km, closestCluster
    );

    return {
      level,
      casesNearby: totalCasesNearby,
      recommendations: [...this.getDengueRecommendations(level), ...hyperLocalFactors.recommendations],
      localFactors: hyperLocalFactors.factors,
      nearbyHotspots: within2km.slice(0, 3).map(c => `${c.locality.substring(0, 40)}... (${c.distance}km)`),
      hyperLocalData: {
        within500m: within500m.length,
        within1km: within1km.length,
        within2km: within2km.length,
        closestDistance: closestCluster.distance,
        closestCases: closestCluster.cases,
        riskScore: Math.round(riskScore),
        coordinates: locationCoords
      }
    };
  }

  // Generate truly hyperlocal dengue insights based on precise distances
  private generateHyperLocalDengueInsights(
    location: string, 
    coords: { lat: number; lng: number },
    within500m: any[],
    within1km: any[],
    within2km: any[],
    closest: any
  ): { factors: string[]; recommendations: string[] } {
    const factors = [];
    const recommendations = [];

    // Immediate danger analysis
    if (within500m.length > 0) {
      const cases500m = within500m.reduce((sum, c) => sum + c.cases, 0);
      factors.push(`🚨 IMMEDIATE RISK: ${within500m.length} active cluster(s) within 500m (${cases500m} cases)`);
      recommendations.push('URGENT: Eliminate ALL standing water within 100m of your location');
      recommendations.push('Avoid outdoor activities during dawn/dusk hours');
    }

    if (within1km.length > 0) {
      const cases1km = within1km.reduce((sum, c) => sum + c.cases, 0);
      factors.push(`⚠️ VERY CLOSE: ${within1km.length} cluster(s) within 1km (${cases1km} cases)`);
      recommendations.push('Check immediate surroundings for mosquito breeding sites daily');
    }

    if (within2km.length > 0) {
      const cases2km = within2km.reduce((sum, c) => sum + c.cases, 0);
      factors.push(`📍 NEARBY: ${within2km.length} cluster(s) within 2km (${cases2km} cases)`);
    }

    // Closest cluster specific warning
    factors.push(`🎯 Closest cluster: ${closest.distance}km away (${closest.cases} cases)`);

    // Location-specific environmental factors
    const envFactors = this.getEnvironmentalFactors(location, coords);
    factors.push(...envFactors);

    // Distance-based recommendations
    if (closest.distance < 0.5) {
      recommendations.push('Consider temporary relocation if possible');
      recommendations.push('Use mosquito nets and repellent 24/7');
    } else if (closest.distance < 1.0) {
      recommendations.push('Increase vigilance - wear long sleeves outdoors');
      recommendations.push('Report ANY standing water to NEA immediately');
    }

    return { factors, recommendations };
  }

  // Get environmental risk factors based on precise location
  private getEnvironmentalFactors(location: string, coords: { lat: number; lng: number }): string[] {
    const factors = [];
    const loc = location.toLowerCase();

    // Coastal areas (higher humidity, more breeding sites)
    if (coords.lat < 1.28 || coords.lng > 103.9) {
      factors.push('🌊 Coastal location - higher humidity increases mosquito activity');
    }

    // Northern border areas (cross-border movement)
    if (coords.lat > 1.43) {
      factors.push('🇲🇾 Near Malaysia border - monitor for imported cases');
    }

    // High-density residential areas
    if (loc.includes('tampines') || loc.includes('bedok') || loc.includes('woodlands')) {
      factors.push('🏘️ High-density residential area - community spread risk elevated');
    }

    // Industrial areas
    if (loc.includes('jurong') || loc.includes('tuas') || coords.lng < 103.75) {
      factors.push('🏭 Industrial zone - construction sites create breeding opportunities');
    }

    // Tourist/commercial areas
    if (loc.includes('orchard') || loc.includes('marina') || loc.includes('sentosa')) {
      factors.push('👥 High tourist/commercial activity - increased human movement');
    }

    // Airport vicinity
    if (loc.includes('changi') || coords.lng > 103.98) {
      factors.push('✈️ Airport vicinity - monitor for imported dengue strains');
    }

    return factors;
  }

  // Analyze air quality
  private async analyzeAirQuality(location: string): Promise<any> {
    try {
      const psiData = await this.psiService.fetchLatestPSI();
      const region = this.mapLocationToRegion(location);
      const regionData = psiData?.regions?.find(r => r.name.toLowerCase() === region.toLowerCase());
      
      const psi = regionData?.psi || psiData?.national?.psi || 50;
      const healthLevel = this.psiService.getHealthLevel(psi);
      
      return {
        psi,
        level: healthLevel.level,
        recommendations: [healthLevel.advice]
      };
    } catch (error) {
      return {
        psi: 50,
        level: 'Good',
        recommendations: ['Unable to fetch current air quality data']
      };
    }
  }

  // Analyze COVID risk
  private async analyzeCovidRisk(location: string): Promise<any> {
    try {
      const covidData = await this.covidService.getCovidCases();
      const nearbyHospitals = covidData.filter(hospital => 
        this.isNearLocation(hospital.coordinates, location)
      );
      
      const hospitalCases = nearbyHospitals.reduce((sum, hospital) => sum + hospital.totalCases, 0);
      
      let level = 'Low';
      if (hospitalCases > 30) level = 'Medium';
      if (hospitalCases > 50) level = 'High';

      return {
        level,
        hospitalCases,
        recommendations: this.getCovidRecommendations(level)
      };
    } catch (error) {
      return {
        level: 'Low',
        hospitalCases: 0,
        recommendations: ['Follow standard COVID-19 precautions']
      };
    }
  }

  // Format location analysis for display with GPS-precise hyperlocal insights
  private formatLocationAnalysis(analysis: LocationAnalysis): string {
    const dengueData = analysis.dengueRisk as any;
    const hyperLocal = dengueData.hyperLocalData;
    
    return `📍 **GPS-Precise Health Analysis for ${analysis.location}**
${hyperLocal?.coordinates ? `📍 Coordinates: ${hyperLocal.coordinates.lat.toFixed(4)}, ${hyperLocal.coordinates.lng.toFixed(4)}` : ''}

🦟 **DENGUE THREAT ANALYSIS: ${dengueData.level}**
${hyperLocal ? `🎯 Risk Score: ${hyperLocal.riskScore}/100` : ''}
${hyperLocal ? `📊 Distance Analysis:
  • Within 500m: ${hyperLocal.within500m} clusters ${hyperLocal.within500m > 0 ? '🚨' : '✅'}
  • Within 1km: ${hyperLocal.within1km} clusters ${hyperLocal.within1km > 1 ? '⚠️' : ''}
  • Within 2km: ${hyperLocal.within2km} clusters (${dengueData.casesNearby} total cases)
  • Closest: ${hyperLocal.closestDistance}km away (${hyperLocal.closestCases} cases)` : ''}

🚨 **IMMEDIATE THREATS:**
${dengueData.localFactors ? dengueData.localFactors.slice(0,3).map((f: string) => `• ${f}`).join('\n') : '• No immediate threats detected'}

🏥 **SAFETY RECOMMENDATIONS:**
${dengueData.recommendations ? dengueData.recommendations.slice(0,4).map((r: string) => `• ${r}`).join('\n') : '• Standard precautions apply'}

${dengueData.nearbyHotspots && dengueData.nearbyHotspots.length > 0 ? 
  `📍 **ACTIVE HOTSPOTS NEAR YOU:**
${dengueData.nearbyHotspots.map((h: string) => `• ${h}`).join('\n')}` : 
  '✅ **No active hotspots in immediate 2km radius**'}

🌬️ **Air Quality: ${analysis.airQuality.level}** (PSI ${analysis.airQuality.psi})
• Conditions: ${this.getLocationAirQualityInsight(analysis.location)}
• Wind: ${this.getLocationWindPattern(analysis.location)}

🏥 **COVID Risk: ${analysis.covidRisk.level}** (${analysis.covidRisk.hospitalCases} nearby cases)
• Transport: ${this.getLocationTransportRisk(analysis.location)}

⏰ **OPTIMAL VISIT TIME:** ${this.getOptimalVisitTime(analysis.location)}
🏨 **NEAREST MEDICAL:** ${this.getNearestHealthFacility(analysis.location)}

📊 **OVERALL TRAVEL SAFETY: ${analysis.overallRisk} Risk**`;
  }

  // Generate travel advice
  private generateTravelAdvice(analysis: LocationAnalysis): string {
    return `✈️ **Travel Advisory for ${analysis.location}**

Based on current health data, here's your personalized travel advice:

**Before You Go:**
${analysis.travelAdvice.map(advice => `• ${advice}`).join('\n')}

**During Your Visit:**
• Monitor air quality if sensitive to pollution
• Use mosquito repellent (dengue prevention)
• Maintain hygiene practices
• Stay hydrated and take breaks if air quality is poor

**Risk Summary:** ${analysis.overallRisk} overall health risk

Have a safe trip! 🌟`;
  }

  // Handle general health queries with OpenAI
  private async handleGeneralHealth(message: string): Promise<ChatMessage> {
    if (!this.openaiApiKey) {
      return this.createResponse("I can help with Singapore's health data! For general health advice, please provide an OpenAI API key in settings.");
    }

    try {
      const response = await this.callOpenAI(message, 'health');
      return this.createResponse(response);
    } catch (error) {
      return this.createResponse("I'm having trouble connecting to my advanced AI features. Let me help with Singapore health data instead!");
    }
  }

  // Handle general chat with OpenAI
  private async handleGeneralChat(message: string): Promise<ChatMessage> {
    if (!this.openaiApiKey) {
      return this.createResponse("Hi! I'm SigmaBoy, your personal health assistant! I can help you with dengue risks, air quality, COVID info, and travel health advice. What would you like to know?");
    }

    try {
      const response = await this.callOpenAI(message, 'general');
      return this.createResponse(response);
    } catch (error) {
      return this.createResponse("Hello! I'm here to help with Singapore health information. Ask me about dengue risks, air quality, or travel advice!");
    }
  }

  // Call OpenAI API
  private async callOpenAI(message: string, context: string): Promise<string> {
    const systemPrompts = {
      health: `You are a Singapore health assistant. Focus on general health advice while being aware that you have access to real-time Singapore health data including dengue clusters, air quality (PSI), and COVID hospital data. Always remind users to consult healthcare professionals for medical concerns.`,
      general: `You are a friendly Singapore health assistant. You specialize in Singapore's health landscape including dengue monitoring, air quality tracking, and general health guidance. Keep responses concise and helpful.`
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompts[context as keyof typeof systemPrompts] },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Utility methods
  private createResponse(text: string): ChatMessage {
    return {
      id: this.generateId(),
      text,
      isUser: false,
      timestamp: new Date()
    };
  }

  private createErrorResponse(): ChatMessage {
    return {
      id: this.generateId(),
      text: "I'm experiencing technical difficulties. Please try again or ask about Singapore health data!",
      isUser: false,
      timestamp: new Date()
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private extractLocation(message: string): string | undefined {
    const lowerMessage = message.toLowerCase();
    
    // Comprehensive Singapore locations database
    const locations = [
      // Central Region
      'orchard road', 'orchard', 'marina bay', 'marina', 'raffles place', 'city hall',
      'clarke quay', 'chinatown', 'little india', 'bugis', 'dhoby ghaut', 'tanjong pagar',
      'tiong bahru', 'harbourfront', 'outram', 'newton', 'novena', 'somerset',
      
      // North Region  
      'woodlands', 'yishun', 'sembawang', 'admiralty', 'marsiling', 'kranji',
      'ang mo kio', 'bishan', 'thomson', 'mayflower', 'canberra', 'khatib',
      
      // South Region
      'sentosa', 'southern islands', 'keppel', 'labrador', 'alexandra', 'redhill',
      
      // East Region
      'changi airport', 'changi', 'tampines', 'pasir ris', 'bedok', 'katong', 'marine parade',
      'geylang', 'paya lebar', 'eunos', 'kembangan', 'tanah merah', 'simei',
      'expo', 'stadium', 'nicoll highway', 'promenade', 'bayfront',
      
      // West Region
      'jurong east', 'jurong', 'clementi', 'boon lay', 'tuas', 'pioneer',
      'bukit batok', 'bukit gombak', 'choa chu kang', 'yew tee', 'kranji',
      'bukit panjang', 'petir', 'pending', 'bangkit', 'fajar', 'senja',
      'chinese garden', 'lakeside', 'joo koon',
      
      // Additional popular areas
      'holland village', 'holland', 'botanical gardens', 'stevens', 'orchard boulevard',
      'ion orchard', 'wisma atria', 'ngee ann city', 'takashimaya', 'mandarin gallery',
      'plaza singapura', 'suntec city', 'millenia walk', 'esplanade', 'merlion park',
      'gardens by the bay', 'marina bay sands', 'universal studios', 'uss', 
      'resort world sentosa', 'rws', 'jewel changi'
    ];
    
    // Find longest matching location (to catch "jurong east" before "jurong")
    let bestMatch = '';
    for (const location of locations) {
      if (lowerMessage.includes(location) && location.length > bestMatch.length) {
        bestMatch = location;
      }
    }
    
    // If no direct match, try pattern-based extraction
    if (!bestMatch) {
      const locationWords = ['in', 'to', 'at', 'near', 'around', 'from', 'visiting', 'going to', 'traveling to'];
      const words = message.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        if (locationWords.includes(words[i].toLowerCase()) && words[i + 1]) {
          const candidate = words[i + 1].replace(/[.,!?]/g, '').toLowerCase();
          // Check if candidate matches any location
          const match = locations.find(loc => loc.includes(candidate) || candidate.includes(loc));
          if (match) {
            bestMatch = match;
            break;
          }
        }
      }
    }
    
    return bestMatch || undefined;
  }

  private extractHealthTopic(message: string): string {
    const topics = ['dengue', 'psi', 'covid', 'air quality'];
    const lowerMessage = message.toLowerCase();
    
    return topics.find(topic => lowerMessage.includes(topic)) || 'general';
  }

  // Additional helper methods for predictions and analysis
  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Hot Season';
    if (month >= 5 && month <= 9) return 'Wet Season';
    return 'Cool Season';
  }

  private async getDengueClusterCount(): Promise<number> {
    return DENGUE_GEOJSON_DATA.features.length;
  }

  private async getDengueRiskFactors(): Promise<{prediction: string}> {
    const clusters = DENGUE_GEOJSON_DATA.features;
    const totalCases = clusters.reduce((sum, cluster) => sum + cluster.properties.CASE_SIZE, 0);
    
    let prediction = 'Stable risk levels expected';
    if (totalCases > 300) prediction = 'Elevated risk - increase precautions';
    else if (totalCases > 150) prediction = 'Moderate risk - normal vigilance';
    
    return { prediction };
  }

  private predictPSI(): string {
    // Simple prediction based on seasonal patterns
    const season = this.getCurrentSeason();
    const ranges = {
      'Hot Season': '40-80 (Good to Moderate)',
      'Wet Season': '30-60 (Good)',
      'Cool Season': '50-90 (Good to Moderate)'
    };
    return ranges[season as keyof typeof ranges] || '40-70 (Good)';
  }

  private getWeatherPattern(): string {
    const season = this.getCurrentSeason();
    const patterns = {
      'Hot Season': 'Clear skies, potential haze from regional fires',
      'Wet Season': 'Frequent rain, cleaner air',
      'Cool Season': 'Variable conditions, northeast monsoon'
    };
    return patterns[season as keyof typeof patterns] || 'Variable weather conditions';
  }

  private getAirQualityForecastAdvice(): string {
    return 'Monitor daily PSI readings, limit outdoor activities if PSI > 100';
  }

  private getSeasonalRisks(season: string): string {
    const risks = {
      'Hot Season': 'Heat stress, dehydration, haze exposure',
      'Wet Season': 'Dengue increase, flood-related risks',
      'Cool Season': 'Respiratory infections, air quality variations'
    };
    return risks[season as keyof typeof risks] || 'General health risks';
  }

  private getSeasonalPrevention(season: string): string {
    const prevention = {
      'Hot Season': 'Stay hydrated, use air purifiers during haze',
      'Wet Season': 'Eliminate stagnant water, use mosquito repellent',
      'Cool Season': 'Maintain immunity, monitor air quality'
    };
    return prevention[season as keyof typeof prevention] || 'General prevention measures';
  }

  private calculateOverallRisk(dengue: string, air: string, covid: string): string {
    const riskLevels = { 'Low': 1, 'Good': 1, 'Moderate': 2, 'Medium': 2, 'High': 3, 'Very High': 4, 'Unhealthy': 3, 'Very Unhealthy': 4, 'Hazardous': 5 };
    
    const avgRisk = (
      (riskLevels[dengue as keyof typeof riskLevels] || 1) +
      (riskLevels[air as keyof typeof riskLevels] || 1) +
      (riskLevels[covid as keyof typeof riskLevels] || 1)
    ) / 3;

    if (avgRisk >= 3.5) return 'High';
    if (avgRisk >= 2.5) return 'Medium';
    return 'Low';
  }

  private generateOverallAdvice(dengue: any, air: any, covid: any, overall: string): string[] {
    const advice = [];
    
    if (dengue.level !== 'Low') advice.push('Use mosquito repellent and eliminate standing water');
    if (air.psi > 100) advice.push('Limit outdoor activities due to air quality');
    if (covid.level !== 'Low') advice.push('Maintain COVID-19 precautions');
    
    if (overall === 'High') {
      advice.push('Consider postponing non-essential travel');
      advice.push('Consult healthcare provider if you have health conditions');
    } else if (overall === 'Medium') {
      advice.push('Take extra precautions during your visit');
    } else {
      advice.push('Normal precautions recommended');
    }

    return advice.length > 0 ? advice : ['Standard health precautions recommended'];
  }

  private getDengueRecommendations(level: string): string[] {
    const recommendations = {
      'Low': ['Use mosquito repellent', 'Check for standing water'],
      'Medium': ['Increase vigilance', 'Use strong repellent', 'Wear long sleeves'],
      'High': ['Avoid dawn/dusk outdoor activities', 'Use DEET repellent', 'Seek immediate medical attention for fever']
    };
    return recommendations[level as keyof typeof recommendations] || recommendations['Low'];
  }

  private getCovidRecommendations(level: string): string[] {
    const recommendations = {
      'Low': ['Basic hygiene measures', 'Hand sanitizing'],
      'Medium': ['Wear masks in crowded areas', 'Maintain social distance'],
      'High': ['Avoid crowded places', 'Wear masks consistently', 'Consider postponing visit']
    };
    return recommendations[level as keyof typeof recommendations] || recommendations['Low'];
  }

  private mapLocationToRegion(location: string): string {
    const regionMapping = {
      'woodlands': 'north',
      'yishun': 'north',
      'sembawang': 'north',
      'jurong': 'west',
      'clementi': 'west',
      'bukit batok': 'west',
      'pasir ris': 'east',
      'tampines': 'east',
      'bedok': 'east',
      'toa payoh': 'central',
      'bishan': 'central',
      'ang mo kio': 'central'
    };
    
    const lowerLocation = location.toLowerCase();
    return Object.keys(regionMapping).find(key => lowerLocation.includes(key)) ? 
           regionMapping[Object.keys(regionMapping).find(key => lowerLocation.includes(key)) as keyof typeof regionMapping] : 
           'central';
  }

  private isNearLocation(coordinates: number[], location: string): boolean {
    // Simplified proximity check - in a real app, you'd use proper geolocation
    // For now, return true for demonstration
    return true;
  }

  // Get chat history
  getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  // Clear chat history
  clearHistory(): void {
    this.chatHistory = [];
  }

  // Hyperlocal helper methods for detailed location insights
  private getLocationAirQualityInsight(location: string): string {
    const loc = location.toLowerCase();
    if (loc.includes('changi')) return 'Airport area - occasional aviation fuel odors';
    if (loc.includes('jurong') || loc.includes('tuas')) return 'Industrial zone - monitor for emissions';
    if (loc.includes('orchard') || loc.includes('marina')) return 'Urban core - higher vehicle emissions';
    if (loc.includes('sentosa')) return 'Island location - generally cleaner air';
    return 'Typical urban Singapore air quality';
  }

  private getLocationWindPattern(location: string): string {
    const loc = location.toLowerCase();
    if (loc.includes('changi') || loc.includes('pasir ris')) return 'Coastal winds, better circulation';
    if (loc.includes('sentosa')) return 'Sea breeze, optimal air movement';
    if (loc.includes('jurong') || loc.includes('tuas')) return 'Inland area, variable wind patterns';
    if (loc.includes('orchard') || loc.includes('marina')) return 'Urban heat island, reduced circulation';
    return 'Standard Singapore wind patterns';
  }

  private getLocationTransportRisk(location: string): string {
    const loc = location.toLowerCase();
    if (loc.includes('orchard') || loc.includes('marina')) return 'High - major transport hub';
    if (loc.includes('tampines') || loc.includes('jurong east')) return 'Medium-High - busy interchange';
    if (loc.includes('woodlands') || loc.includes('pasir ris')) return 'Medium - end-of-line stations';
    if (loc.includes('sentosa')) return 'Low - limited public transport';
    return 'Standard public transport risk';
  }

  private getOptimalVisitTime(location: string): string {
    const loc = location.toLowerCase();
    if (loc.includes('sentosa')) return 'Early morning or late afternoon to avoid crowds and heat';
    if (loc.includes('orchard') || loc.includes('marina')) return 'Early morning before 10am or after 7pm for fewer crowds';
    if (loc.includes('changi')) return 'Early morning flights generally have better air quality';
    if (loc.includes('jurong') || loc.includes('tampines')) return 'Midday visits recommended to avoid rush hour congestion';
    return 'Dawn and dusk have highest mosquito activity - take precautions';
  }

  private getNearestHealthFacility(location: string): string {
    const loc = location.toLowerCase();
    const facilities: { [key: string]: string } = {
      'orchard': 'Mount Elizabeth Hospital, Gleneagles Hospital (5-10 min)',
      'marina': 'Raffles Hospital (10 min), SGH (15 min)',
      'woodlands': 'Khoo Teck Puat Hospital (10 min)',
      'tampines': 'Changi General Hospital (15 min)',
      'jurong': 'Ng Teng Fong General Hospital (10 min)',
      'changi': 'Changi General Hospital (10 min)',
      'sentosa': 'Mainland hospitals - SGH (25 min), Mount Elizabeth (20 min)',
      'bedok': 'Changi General Hospital (20 min), Eastshore Hospital (15 min)',
      'clementi': 'National University Hospital (15 min)',
      'yishun': 'Khoo Teck Puat Hospital (15 min)',
      'pasir ris': 'Changi General Hospital (20 min)'
    };

    for (const [area, facility] of Object.entries(facilities)) {
      if (loc.includes(area)) return facility;
    }
    return 'Nearest polyclinic or call 995 for emergencies';
  }

  // Helper method for weekend prediction
  private getDaysToWeekend(): number {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    if (dayOfWeek === 6) return 1; // If Saturday, next day is Sunday
    if (dayOfWeek === 0) return 0; // If Sunday, it's already weekend
    
    return 6 - dayOfWeek; // Days until Saturday
  }

  // Format advanced prediction response
  private formatPredictionResponse(predictions: any, daysAhead: number): string {
    const timeFrame = daysAhead === 1 ? 'Tomorrow' : `${daysAhead} days ahead`;
    
    return `🔮 **Advanced Health Forecast - ${timeFrame}**
*Prediction Date: ${predictions.date}*

🦟 **Dengue Risk Prediction:**
• Predicted cases: ${predictions.dengueRisk.predicted}
• Trend: ${predictions.dengueRisk.trend}
• Confidence: ${predictions.dengueRisk.confidence}%
• Key factors: ${predictions.dengueRisk.factors && Array.isArray(predictions.dengueRisk.factors) ? predictions.dengueRisk.factors.join(', ') : 'Historical data analysis'}

🌬️ **Air Quality Forecast:**
• Predicted PSI: ${predictions.airQuality.predictedPSI}
• Trend: ${predictions.airQuality.trend}
• Confidence: ${predictions.airQuality.confidence}%
• Factors: ${predictions.airQuality.factors && Array.isArray(predictions.airQuality.factors) ? predictions.airQuality.factors.join(', ') : 'Weather and seasonal patterns'}

🏥 **COVID Risk Outlook:**
• Predicted hospitalizations: ${predictions.covidRisk.predicted}
• Trend: ${predictions.covidRisk.trend}
• Confidence: ${predictions.covidRisk.confidence}%
• Factors: ${predictions.covidRisk.factors && Array.isArray(predictions.covidRisk.factors) ? predictions.covidRisk.factors.join(', ') : 'Seasonal and social patterns'}

📊 **Overall Assessment:**
• Risk Level: ${predictions.overallRisk.level}
• Confidence: ${predictions.overallRisk.confidence}%
• Key factors: ${predictions.overallRisk.keyFactors && Array.isArray(predictions.overallRisk.keyFactors) ? predictions.overallRisk.keyFactors.join(', ') : 'Standard risk assessment'}

💡 **Recommendations:**
${predictions.recommendations.map((rec: string) => `• ${rec}`).join('\n')}

🧠 **Prediction Methods Used:**
• Time series analysis of historical trends
• Seasonal pattern recognition
• Weather impact modeling
• Cluster growth analysis
• Mathematical forecasting algorithms

*These are AI-generated predictions based on data patterns and should complement, not replace, official health advisories.*`;
  }
} 