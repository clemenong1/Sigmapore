import { DENGUE_GEOJSON_DATA } from '../data/dengueData';
import { PSIService } from './psiService';
import { CovidService } from './covidService';

export interface PredictionData {
  date: string;
  dengueRisk: {
    predicted: number;
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    factors: string[];
  };
  airQuality: {
    predictedPSI: number;
    confidence: number;
    trend: 'improving' | 'worsening' | 'stable';
    factors: string[];
  };
  covidRisk: {
    predicted: number;
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    factors: string[];
  };
  overallRisk: {
    level: string;
    confidence: number;
    keyFactors: string[];
  };
  recommendations: string[];
}

export interface TrendAnalysis {
  shortTerm: number; // 1-7 days
  mediumTerm: number; // 1-4 weeks  
  longTerm: number; // 1-3 months
  seasonalFactor: number;
  weatherImpact: number;
}

export class HealthPredictionService {
  private psiService: PSIService;
  private covidService: CovidService;
  private historicalData: Map<string, any[]> = new Map();

  constructor() {
    this.psiService = new PSIService();
    this.covidService = new CovidService();
    this.initializeHistoricalData();
  }

  // Location coordinates database for GPS-precise predictions
  private locationCoordinates: { [key: string]: { lat: number; lng: number } } = {
    // Central Region
    'orchard': { lat: 1.3048, lng: 103.8318 },
    'marina bay': { lat: 1.2810, lng: 103.8598 },
    'chinatown': { lat: 1.2833, lng: 103.8437 },
    'bugis': { lat: 1.3000, lng: 103.8558 },
    'raffles place': { lat: 1.2845, lng: 103.8507 },
    'little india': { lat: 1.3063, lng: 103.8516 },
    'clarke quay': { lat: 1.2888, lng: 103.8467 },
    'toa payoh': { lat: 1.3343, lng: 103.8470 },
    'bishan': { lat: 1.3503, lng: 103.8487 },
    'ang mo kio': { lat: 1.3690, lng: 103.8454 },
    
    // North Region
    'woodlands': { lat: 1.4382, lng: 103.7890 },
    'yishun': { lat: 1.4304, lng: 103.8354 },
    'sembawang': { lat: 1.4491, lng: 103.8185 },
    'admiralty': { lat: 1.4407, lng: 103.8010 },
    'marsiling': { lat: 1.4327, lng: 103.7742 },
    
    // South Region
    'sentosa': { lat: 1.2494, lng: 103.8303 },
    'harbourfront': { lat: 1.2659, lng: 103.8223 },
    'tiong bahru': { lat: 1.2855, lng: 103.8270 },
    'tanjong pagar': { lat: 1.2762, lng: 103.8458 },
    'queenstown': { lat: 1.2941, lng: 103.8059 },
    
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
    'jurong west': { lat: 1.3404, lng: 103.7090 },
    'boon lay': { lat: 1.3387, lng: 103.7018 },
    'clementi': { lat: 1.3162, lng: 103.7649 },
    'tuas': { lat: 1.2966, lng: 103.6361 },
    'bukit batok': { lat: 1.3590, lng: 103.7637 },
    'choa chu kang': { lat: 1.3840, lng: 103.7470 },
    'bukit panjang': { lat: 1.3774, lng: 103.7719 },
    
    // North-East Region
    'hougang': { lat: 1.3613, lng: 103.8862 },
    'serangoon': { lat: 1.3554, lng: 103.8654 },
    'punggol': { lat: 1.4043, lng: 103.9021 },
    'sengkang': { lat: 1.3916, lng: 103.8946 }
  };

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

  // Fallback island-wide dengue prediction for unknown locations
  private predictIslandWideDengueRisk(daysAhead: number): any {
    const currentClusters = DENGUE_GEOJSON_DATA.features;
    const currentCases = currentClusters.reduce((sum, cluster) => sum + cluster.properties.CASE_SIZE, 0);
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    const seasonalFactor = this.getSeasonalFactor(targetDate);
    const weatherMultiplier = this.getWeatherImpact('dengue', daysAhead);
    const clusterGrowthRate = this.analyzeClusterGrowth(currentClusters);
    const weeklyTrend = this.getWeeklyTrend(daysAhead);
    
    const basePrediction = currentCases * (1 + (weeklyTrend / 100));
    const finalPrediction = basePrediction * weatherMultiplier * (1 + seasonalFactor) * (1 + clusterGrowthRate);
    
    return {
      predicted: Math.max(0, Math.round(finalPrediction)),
      confidence: this.calculateConfidence(seasonalFactor, weatherMultiplier, 0.65),
      trend: finalPrediction > currentCases * 1.1 ? 'increasing' : 'stable',
      factors: [`Island-wide: ${currentCases} total cases`, 'General Singapore forecast'],
      isHyperlocal: false
    };
  }

  // Analyze local cluster growth patterns (for nearby clusters only)
  private analyzeLocalClusterGrowth(nearbyClusters: any[]): number {
    if (nearbyClusters.length === 0) return 0;
    
    // Simulate local growth based on cluster density and cases
    const totalLocalCases = nearbyClusters.reduce((sum, c) => sum + c.cases, 0);
    const avgCasesPerCluster = totalLocalCases / nearbyClusters.length;
    
    // Higher growth rate if clusters are dense and large
    if (avgCasesPerCluster > 15 && nearbyClusters.length > 2) return 0.15; // 15% growth
    if (avgCasesPerCluster > 10) return 0.1; // 10% growth  
    if (avgCasesPerCluster > 5) return 0.05; // 5% growth
    return 0.02; // 2% baseline growth
  }

  // Initialize with simulated historical data (in real app, load from database)
  private initializeHistoricalData() {
    const dates = this.generateDateRange(30); // Last 30 days
    
    // Simulate dengue trends
    const dengueTrend = dates.map((date, index) => ({
      date,
      cases: 120 + Math.sin(index * 0.2) * 30 + Math.random() * 20,
      weather: this.getWeatherPattern(date),
      seasonalFactor: this.getSeasonalFactor(new Date(date))
    }));

    // Simulate PSI trends
    const psiTrend = dates.map((date, index) => ({
      date,
      psi: 55 + Math.sin(index * 0.15) * 25 + Math.random() * 15,
      weather: this.getWeatherPattern(date),
      windSpeed: 5 + Math.random() * 10
    }));

    // Simulate COVID trends
    const covidTrend = dates.map((date, index) => ({
      date,
      cases: 50 + Math.sin(index * 0.1) * 15 + Math.random() * 10,
      hospitalizations: 30 + Math.random() * 20
    }));

    this.historicalData.set('dengue', dengueTrend);
    this.historicalData.set('psi', psiTrend);
    this.historicalData.set('covid', covidTrend);
  }

  // Main prediction function
  async predictHealthConditions(location: string, daysAhead: number = 1): Promise<PredictionData> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);

    const [dengueAnalysis, airQualityAnalysis, covidAnalysis] = await Promise.all([
      this.predictDengueRisk(location, daysAhead),
      this.predictAirQuality(location, daysAhead),
      this.predictCovidRisk(location, daysAhead)
    ]);

    const overallRisk = this.calculateOverallPrediction(dengueAnalysis, airQualityAnalysis, covidAnalysis);
    const recommendations = this.generatePredictiveRecommendations(dengueAnalysis, airQualityAnalysis, covidAnalysis, daysAhead);

    return {
      date: targetDate.toISOString().split('T')[0],
      dengueRisk: dengueAnalysis,
      airQuality: airQualityAnalysis,
      covidRisk: covidAnalysis,
      overallRisk,
      recommendations
    };
  }

  // HYPERLOCAL Dengue prediction using GPS-based cluster analysis + weather patterns
  private async predictDengueRisk(location: string, daysAhead: number): Promise<any> {
    const currentClusters = DENGUE_GEOJSON_DATA.features;
    const locationCoords = this.getLocationCoordinates(location);
    
    if (!locationCoords) {
      // Fallback to island-wide prediction for unknown locations
      return this.predictIslandWideDengueRisk(daysAhead);
    }

    // HYPERLOCAL ANALYSIS: Calculate distances to all clusters for this specific location
    const clusterDistances = currentClusters.map(cluster => {
      const clusterCoords = cluster.geometry.coordinates[0][0]; // [lng, lat]
      const distance = this.calculateDistance(
        locationCoords.lat, locationCoords.lng,
        clusterCoords[1], clusterCoords[0]
      );
      return { cluster, distance, cases: cluster.properties.CASE_SIZE };
    });

    // Sort by distance and get nearby clusters
    clusterDistances.sort((a, b) => a.distance - b.distance);
    const within2km = clusterDistances.filter(c => c.distance <= 2.0);
    const within5km = clusterDistances.filter(c => c.distance <= 5.0);
    
    const currentLocalCases = within2km.reduce((sum, c) => sum + c.cases, 0);
    const nearbyInfluence = within5km.reduce((sum, c) => sum + (c.cases / (c.distance + 1)), 0);

    // Weather impact (monsoon season increases risk)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    const seasonalFactor = this.getSeasonalFactor(targetDate);
    const weatherMultiplier = this.getWeatherImpact('dengue', daysAhead);
    
    // Local cluster growth pattern (focus on nearby clusters)
    const localGrowthRate = this.analyzeLocalClusterGrowth(within2km);
    
    // Weekly trend simulation with local factors
    const weeklyTrend = this.getWeeklyTrend(daysAhead);
    
    // HYPERLOCAL Prediction calculation
    const baseLocalPrediction = currentLocalCases * (1 + (weeklyTrend / 100));
    const influenceFactor = nearbyInfluence * 0.3; // Nearby clusters influence
    const weatherAdjusted = (baseLocalPrediction + influenceFactor) * weatherMultiplier;
    const seasonalAdjusted = weatherAdjusted * (1 + seasonalFactor);
    const finalPrediction = seasonalAdjusted * (1 + localGrowthRate);

    const predicted = Math.max(0, Math.round(finalPrediction));
    const confidence = this.calculateConfidence(seasonalFactor, weatherMultiplier, 0.8); // Higher confidence for hyperlocal
    
    let trend: 'increasing' | 'decreasing' | 'stable';
    if (predicted > currentLocalCases * 1.15) trend = 'increasing';
    else if (predicted < currentLocalCases * 0.85) trend = 'decreasing';
    else trend = 'stable';

    const factors = [
      `${location}: ${currentLocalCases} cases within 2km, ${within2km.length} active clusters nearby`,
      `Closest cluster: ${clusterDistances[0]?.distance.toFixed(1)}km away (${clusterDistances[0]?.cases} cases)`,
      `Seasonal factor: ${seasonalFactor > 0 ? 'High risk period (wet season)' : 'Lower risk period'}`,
      `Weather impact: ${weatherMultiplier > 1 ? 'Favorable for mosquito breeding' : 'Less favorable conditions'}`,
      `Local growth pattern: ${localGrowthRate > 0.1 ? 'Rapid expansion expected in nearby clusters' : 'Steady progression'}`
    ];

    return { predicted, confidence, trend, factors, isHyperlocal: true };
  }

  // Air quality prediction using weather patterns
  private async predictAirQuality(location: string, daysAhead: number): Promise<any> {
    try {
      const currentPSI = await this.psiService.fetchLatestPSI();
      const baseline = currentPSI?.national?.psi || 50;
      
      // Weather pattern impact
      const weatherImpact = this.getWeatherImpact('air', daysAhead);
      
      // Regional haze factor
      const hazeFactor = this.getHazeProbability(daysAhead);
      
      // Wind pattern impact
      const windFactor = this.getWindImpact(daysAhead);
      
      // Day-of-week pattern (weekends typically better)
      const dayPattern = this.getDayOfWeekPattern(daysAhead);
      
      // Prediction calculation
      const trendPrediction = baseline + this.getAirQualityTrend(daysAhead);
      const weatherAdjusted = trendPrediction * weatherImpact;
      const hazeAdjusted = weatherAdjusted + hazeFactor;
      const windAdjusted = hazeAdjusted * windFactor;
      const finalPrediction = windAdjusted * dayPattern;

      const predictedPSI = Math.max(20, Math.round(finalPrediction));
      const confidence = this.calculateConfidence(weatherImpact, windFactor, 0.7);
      
      let trend: 'improving' | 'worsening' | 'stable';
      if (predictedPSI > baseline * 1.2) trend = 'worsening';
      else if (predictedPSI < baseline * 0.8) trend = 'improving';
      else trend = 'stable';

      const factors = [
        `Current PSI: ${baseline}`,
        `Weather pattern: ${weatherImpact > 1 ? 'Stagnant conditions expected' : 'Good air circulation'}`,
        `Haze risk: ${hazeFactor > 10 ? 'Elevated due to regional factors' : 'Low transboundary haze risk'}`,
        `Wind conditions: ${windFactor < 1 ? 'Strong winds forecasted' : 'Calm conditions expected'}`
      ];

      return { predictedPSI, confidence, trend, factors };
    } catch (error) {
      return this.getDefaultAirQualityPrediction();
    }
  }

  // COVID risk prediction using hospitalization trends
  private async predictCovidRisk(location: string, daysAhead: number): Promise<any> {
    try {
      const covidData = await this.covidService.getCovidCases();
      const currentHospitalizations = covidData.reduce((sum: number, hospital: any) => sum + hospital.hospitalised, 0);
      
      // Seasonal factor (respiratory viruses in cool weather)
      const seasonalFactor = this.getCovidSeasonalFactor();
      
      // Crowd factor (events, holidays)
      const crowdFactor = this.getCrowdingFactor(daysAhead);
      
      // Weekly trend
      const weeklyTrend = this.getWeeklyTrend(daysAhead, 'covid');
      
      // Prediction calculation
      const basePrediction = currentHospitalizations * (1 + (weeklyTrend / 100));
      const seasonalAdjusted = basePrediction * (1 + seasonalFactor);
      const finalPrediction = seasonalAdjusted * crowdFactor;

      const predicted = Math.max(0, Math.round(finalPrediction));
      const confidence = this.calculateConfidence(seasonalFactor, crowdFactor, 0.65);
      
      let trend: 'increasing' | 'decreasing' | 'stable';
      if (predicted > currentHospitalizations * 1.15) trend = 'increasing';
      else if (predicted < currentHospitalizations * 0.85) trend = 'decreasing';
      else trend = 'stable';

      const factors = [
        `Current hospitalizations: ${currentHospitalizations}`,
        `Seasonal pattern: ${seasonalFactor > 0 ? 'Higher risk period' : 'Lower risk period'}`,
        `Social factors: ${crowdFactor > 1 ? 'Increased gatherings expected' : 'Normal social activity'}`,
        `Weekly trend: ${weeklyTrend > 0 ? 'Rising pattern' : 'Declining pattern'}`
      ];

      return { predicted, confidence, trend, factors };
    } catch (error) {
      return this.getDefaultCovidPrediction();
    }
  }

  // Weather impact factors
  private getWeatherImpact(type: string, daysAhead: number): number {
    const season = this.getCurrentSeason();
    
    if (type === 'dengue') {
      // Higher during wet season
      if (season === 'Wet Season') return 1.2 + (Math.random() * 0.2);
      if (season === 'Hot Season') return 1.1 + (Math.random() * 0.15);
      return 0.9 + (Math.random() * 0.1);
    } else if (type === 'air') {
      // Worse during hot season (haze) and cool season (low wind)
      if (season === 'Hot Season') return 1.3 + (Math.random() * 0.3);
      if (season === 'Cool Season') return 1.1 + (Math.random() * 0.2);
      return 0.8 + (Math.random() * 0.1);
    }
    
    return 1.0;
  }

  // Seasonal factors
  private getSeasonalFactor(date: Date): number {
    const month = date.getMonth();
    
    // Dengue peak: May-October (wet season)
    if (month >= 4 && month <= 9) return 0.3; // 30% higher risk
    if (month >= 2 && month <= 4) return 0.1; // Transitional
    return -0.1; // Lower risk in dry season
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Hot Season';
    if (month >= 5 && month <= 9) return 'Wet Season';
    return 'Cool Season';
  }

  // Cluster growth analysis
  private analyzeClusterGrowth(clusters: any[]): number {
    const activeClusters = clusters.length;
    const avgCaseSize = clusters.reduce((sum, c) => sum + c.properties.CASE_SIZE, 0) / activeClusters;
    
    // More clusters or larger average size = higher growth potential
    if (activeClusters > 5 && avgCaseSize > 30) return 0.15; // 15% growth
    if (activeClusters > 3 || avgCaseSize > 20) return 0.08; // 8% growth
    return 0.02; // Minimal growth
  }

  // Weekly trend simulation
  private getWeeklyTrend(daysAhead: number, type: string = 'dengue'): number {
    // Simulate weekly trends based on historical patterns
    const baseVariation = type === 'dengue' ? 5 : type === 'air' ? 8 : 3;
    return (Math.random() - 0.5) * baseVariation; // -2.5% to +2.5% for dengue
  }

  // Air quality specific trend
  private getAirQualityTrend(daysAhead: number): number {
    // PSI tends to vary more on weekends and during certain weather patterns
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
    
    const baseTrend = (Math.random() - 0.5) * 15; // ±7.5 PSI variation
    return isWeekend ? baseTrend * 0.7 : baseTrend; // Lower variation on weekends
  }

  // Haze probability based on regional weather patterns
  private getHazeProbability(daysAhead: number): number {
    const season = this.getCurrentSeason();
    const baseHazeRisk = season === 'Hot Season' ? 20 : 5; // PSI increase
    
    // Simulate weekly haze forecast
    if (daysAhead <= 3) return baseHazeRisk * 0.5;
    if (daysAhead <= 7) return baseHazeRisk;
    return baseHazeRisk * 1.5;
  }

  // Wind impact on air quality
  private getWindImpact(daysAhead: number): number {
    // Simulate wind patterns - strong winds improve air quality
    const baseWindFactor = 0.9 + (Math.random() * 0.2); // 0.9-1.1
    
    // Weekend typically has less wind in urban areas
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
    
    return isWeekend ? baseWindFactor * 1.1 : baseWindFactor;
  }

  // Day of week patterns
  private getDayOfWeekPattern(daysAhead: number): number {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    const dayOfWeek = targetDate.getDay();
    
    // Weekend typically has better air quality (less traffic)
    if (dayOfWeek === 0 || dayOfWeek === 6) return 0.9; // 10% better
    if (dayOfWeek === 1 || dayOfWeek === 5) return 1.05; // Monday/Friday slightly worse
    return 1.0; // Normal weekday
  }

  // COVID seasonal factors
  private getCovidSeasonalFactor(): number {
    const season = this.getCurrentSeason();
    // Respiratory viruses typically peak in cooler months
    if (season === 'Cool Season') return 0.2; // 20% higher
    if (season === 'Hot Season') return -0.1; // 10% lower
    return 0.05; // Slightly higher in wet season
  }

  // Crowding factor for COVID
  private getCrowdingFactor(daysAhead: number): number {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    
    // Check for major holidays/events (simplified)
    const month = targetDate.getMonth();
    const day = targetDate.getDate();
    
    // Chinese New Year, Deepavali, Christmas periods
    if ((month === 1 && day <= 15) || (month === 10) || (month === 11 && day >= 20)) {
      return 1.3; // 30% higher due to gatherings
    }
    
    // Weekend factor
    const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
    return isWeekend ? 1.1 : 1.0;
  }

  // Overall risk calculation
  private calculateOverallPrediction(dengue: any, air: any, covid: any): any {
    const dengueScore = this.riskToScore(dengue.predicted, 'dengue');
    const airScore = this.riskToScore(air.predictedPSI, 'air');
    const covidScore = this.riskToScore(covid.predicted, 'covid');
    
    // Weighted average (dengue and air quality are primary concerns in Singapore)
    const overallScore = (dengueScore * 0.4) + (airScore * 0.4) + (covidScore * 0.2);
    
    let level: string;
    if (overallScore >= 70) level = 'High';
    else if (overallScore >= 40) level = 'Medium';
    else level = 'Low';
    
    const confidence = Math.min(dengue.confidence, air.confidence, covid.confidence);
    
    const keyFactors = [
      dengue.trend === 'increasing' ? 'Rising dengue trend detected' : null,
      air.trend === 'worsening' ? 'Air quality deterioration expected' : null,
      covid.trend === 'increasing' ? 'COVID cases trending upward' : null
    ].filter(Boolean);

    return { level, confidence, keyFactors };
  }

  // Convert predictions to risk scores
  private riskToScore(value: number, type: string): number {
    switch (type) {
      case 'dengue':
        if (value > 200) return 80;
        if (value > 100) return 60;
        if (value > 50) return 40;
        return 20;
      case 'air':
        if (value > 200) return 90;
        if (value > 100) return 70;
        if (value > 50) return 40;
        return 20;
      case 'covid':
        if (value > 100) return 70;
        if (value > 50) return 50;
        if (value > 20) return 30;
        return 15;
      default:
        return 30;
    }
  }

  // Generate actionable recommendations
  private generatePredictiveRecommendations(dengue: any, air: any, covid: any, daysAhead: number): string[] {
    const recommendations: string[] = [];
    
    // Time-specific advice
    if (daysAhead === 1) {
      recommendations.push('📅 Tomorrow\'s Health Forecast:');
    } else if (daysAhead <= 7) {
      recommendations.push(`📅 ${daysAhead}-Day Health Outlook:`);
    } else {
      recommendations.push(`📅 Extended Forecast (${daysAhead} days):`);
    }

    // Dengue recommendations
    if (dengue.trend === 'increasing') {
      recommendations.push('🦟 Dengue Alert: Enhanced prevention needed');
      recommendations.push('• Remove standing water daily');
      recommendations.push('• Use DEET repellent when outdoors');
      recommendations.push('• Wear long sleeves during dawn/dusk');
    }

    // Air quality recommendations
    if (air.trend === 'worsening') {
      recommendations.push('🌬️ Air Quality Warning: Prepare for poor conditions');
      if (air.predictedPSI > 100) {
        recommendations.push('• N95 masks essential for outdoor activities');
        recommendations.push('• Keep windows closed, use air purifiers');
        recommendations.push('• Avoid outdoor exercise');
      } else {
        recommendations.push('• Consider masks for sensitive individuals');
        recommendations.push('• Limit prolonged outdoor activities');
      }
    }

    // COVID recommendations
    if (covid.trend === 'increasing') {
      recommendations.push('🏥 COVID Trend: Increased vigilance recommended');
      recommendations.push('• Enhanced hand hygiene protocols');
      recommendations.push('• Masks in crowded indoor spaces');
      recommendations.push('• Monitor symptoms closely');
    }

    // Overall recommendations
    const overallScore = (this.riskToScore(dengue.predicted, 'dengue') + 
                         this.riskToScore(air.predictedPSI, 'air') + 
                         this.riskToScore(covid.predicted, 'covid')) / 3;

    if (overallScore > 60) {
      recommendations.push('⚠️ High Risk Period: Consider postponing non-essential outdoor activities');
    } else if (overallScore > 40) {
      recommendations.push('⚡ Moderate Risk: Take standard precautions');
    } else {
      recommendations.push('✅ Low Risk: Normal activities with basic precautions');
    }

    return recommendations;
  }

  // Confidence calculation
  private calculateConfidence(factor1: number, factor2: number, baseConfidence: number): number {
    // Higher confidence when factors are within expected ranges
    const factor1Stability = Math.max(0.5, 1 - Math.abs(factor1 - 1) * 0.5);
    const factor2Stability = Math.max(0.5, 1 - Math.abs(factor2 - 1) * 0.5);
    
    const avgStability = (factor1Stability + factor2Stability) / 2;
    return Math.round(baseConfidence * avgStability * 100);
  }

  // Utility functions
  private generateDateRange(days: number): string[] {
    const dates: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }

  private getWeatherPattern(date: string): any {
    // Simulate weather data
    return {
      temperature: 28 + Math.random() * 6,
      humidity: 70 + Math.random() * 20,
      rainfall: Math.random() * 10
    };
  }

  // Default predictions for error cases
  private getDefaultAirQualityPrediction(): any {
    return {
      predictedPSI: 55,
      confidence: 50,
      trend: 'stable' as const,
      factors: ['Using default prediction - data temporarily unavailable']
    };
  }

  private getDefaultCovidPrediction(): any {
    return {
      predicted: 30,
      confidence: 50,
      trend: 'stable' as const,
      factors: ['Using default prediction - data temporarily unavailable']
    };
  }
}

export default HealthPredictionService; 