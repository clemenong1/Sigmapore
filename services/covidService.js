// COVID-19 Service - Parse and process patient admission locations
export class CovidService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours cache for static data
  }

  // Parse KML data and extract COVID-19 cases
  async getCovidCases() {
    const cacheKey = 'covid_cases';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // In a real app, you'd fetch this from a server or local file
      // For now, we'll use the parsed data directly
      const covidData = this.parseKMLData();
      
      this.cache.set(cacheKey, {
        data: covidData,
        timestamp: Date.now()
      });
      
      return covidData;
    } catch (error) {
      console.error('Error loading COVID-19 data:', error);
      throw error;
    }
  }

  // Parse the KML data into usable format
  parseKMLData() {
    // COVID-19 cases data extracted from KML
    const cases = [
      { id: 1, hospital: 'Singapore General Hospital', status: 'Hospitalised', coordinates: [103.834938, 1.27849] },
      { id: 2, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 3, hospital: 'Singapore General Hospital', status: 'Hospitalised', coordinates: [103.834938, 1.27849] },
      { id: 4, hospital: 'Sengkang General Hospital', status: 'Discharged', coordinates: [103.8912143, 1.3954984] },
      { id: 5, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 6, hospital: 'Changi General Hospital', status: 'Hospitalised', coordinates: [103.9473814, 1.3401969] },
      { id: 7, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 8, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 9, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 10, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 11, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 12, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 13, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 14, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 15, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 16, hospital: 'Singapore General Hospital', status: 'Hospitalised', coordinates: [103.834938, 1.27849] },
      { id: 17, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 18, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 19, hospital: 'Singapore General Hospital', status: 'Hospitalised', coordinates: [103.834938, 1.27849] },
      { id: 20, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 21, hospital: 'Singapore General Hospital', status: 'Hospitalised', coordinates: [103.834938, 1.27849] },
      { id: 22, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 23, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 24, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 25, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 26, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 27, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 28, hospital: 'KK Women\'s and Children\'s Hospital', status: 'Hospitalised', coordinates: [103.8446167, 1.3106687] },
      { id: 29, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 30, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 31, hospital: 'Changi General Hospital', status: 'Discharged', coordinates: [103.9473814, 1.3401969] },
      { id: 32, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 33, hospital: 'Sengkang General Hospital', status: 'Hospitalised', coordinates: [103.8912143, 1.3954984] },
      { id: 34, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 35, hospital: 'Singapore General Hospital', status: 'Hospitalised', coordinates: [103.834938, 1.27849] },
      { id: 36, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 37, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 38, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 39, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 40, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 41, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 42, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 43, hospital: 'Sengkang General Hospital', status: 'Hospitalised', coordinates: [103.8912143, 1.3954984] },
      { id: 44, hospital: 'Khoo Teck Puat Hospital', status: 'Hospitalised', coordinates: [103.8359687, 1.4245588] },
      { id: 45, hospital: 'KK Women\'s and Children\'s Hospital', status: 'Discharged', coordinates: [103.8446167, 1.3106687] },
      { id: 46, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 47, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 48, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 49, hospital: 'National University Hospital', status: 'Hospitalised', coordinates: [103.7809869, 1.2937332] },
      { id: 50, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 51, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 52, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 53, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 54, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 55, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 56, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 57, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 58, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 59, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 60, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 61, hospital: 'National University Hospital', status: 'Hospitalised', coordinates: [103.77266, 1.29067] },
      { id: 62, hospital: 'Singapore General Hospital', status: 'Hospitalised', coordinates: [103.834938, 1.27849] },
      { id: 63, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 64, hospital: 'National University Hospital', status: 'Hospitalised', coordinates: [103.7809869, 1.2937332] },
      { id: 65, hospital: 'National Centre for Infectious Disease', status: 'Discharged', coordinates: [103.8472413, 1.3221188] },
      { id: 66, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 67, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 68, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 69, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 70, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 71, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 72, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 73, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 74, hospital: 'Alexandra Hospital', status: 'Hospitalised', coordinates: [103.7990862, 1.2865936] },
      { id: 75, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] },
      { id: 76, hospital: 'KK Women\'s and Children\'s Hospital', status: 'Hospitalised', coordinates: [103.8446167, 1.3106687] },
      { id: 77, hospital: 'National Centre for Infectious Disease', status: 'Hospitalised', coordinates: [103.8472413, 1.3221188] }
    ];

    return this.processCovidData(cases);
  }

  // Process COVID-19 data into clusters by hospital
  processCovidData(cases) {
    const hospitalClusters = new Map();
    
    cases.forEach(caseData => {
      const key = `${caseData.hospital}-${caseData.coordinates[0]}-${caseData.coordinates[1]}`;
      
      if (!hospitalClusters.has(key)) {
        hospitalClusters.set(key, {
          hospital: caseData.hospital,
          coordinates: caseData.coordinates,
          totalCases: 0,
          hospitalised: 0,
          discharged: 0,
          cases: []
        });
      }
      
      const cluster = hospitalClusters.get(key);
      cluster.totalCases++;
      cluster.cases.push(caseData);
      
      if (caseData.status === 'Hospitalised') {
        cluster.hospitalised++;
      } else {
        cluster.discharged++;
      }
    });

    return Array.from(hospitalClusters.values()).map(cluster => ({
      ...cluster,
      id: this.generateClusterId(cluster.hospital),
      riskLevel: this.calculateRiskLevel(cluster.totalCases),
      lastUpdated: 'Historical Data'
    }));
  }

  // Generate unique cluster ID
  generateClusterId(hospital) {
    return hospital.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  }

  // Calculate risk level based on case count
  calculateRiskLevel(caseCount) {
    if (caseCount >= 30) return 'Very High';
    if (caseCount >= 15) return 'High';
    if (caseCount >= 5) return 'Medium';
    return 'Low';
  }

  // Get color for risk level
  getRiskColor(riskLevel) {
    switch (riskLevel) {
      case 'Very High': return '#8B0000'; // Dark red
      case 'High': return '#DC143C'; // Crimson
      case 'Medium': return '#FF8C00'; // Dark orange
      case 'Low': return '#32CD32'; // Lime green
      default: return '#808080'; // Gray
    }
  }

  // Get hospital statistics
  getHospitalStats(clusters) {
    const stats = {
      totalHospitals: clusters.length,
      totalCases: clusters.reduce((sum, cluster) => sum + cluster.totalCases, 0),
      totalHospitalised: clusters.reduce((sum, cluster) => sum + cluster.hospitalised, 0),
      totalDischarged: clusters.reduce((sum, cluster) => sum + cluster.discharged, 0),
      hospitalBreakdown: clusters.map(cluster => ({
        name: cluster.hospital,
        cases: cluster.totalCases,
        hospitalised: cluster.hospitalised,
        discharged: cluster.discharged
      }))
    };
    
    return stats;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export default new CovidService(); 