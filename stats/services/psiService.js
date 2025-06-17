// PSI Service - Singapore Air Quality Data
// Based on official NEA API: https://api-open.data.gov.sg/v2/real-time/api/psi

export class PSIService {
  constructor() {
    this.baseURL = 'https://api-open.data.gov.sg/v2/real-time/api';
    this.cache = new Map();
    this.cacheTimeout = 60 * 60 * 1000; // 1 hour cache
  }

  // Fetch latest PSI data
  async fetchLatestPSI() {
    const cacheKey = 'latest_psi';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseURL}/psi`);
      const data = await response.json();
      
      if (data.code === 0) {
        const processedData = this.processPSIData(data.data);
        this.cache.set(cacheKey, {
          data: processedData,
          timestamp: Date.now()
        });
        return processedData;
      } else {
        throw new Error(data.errorMsg || 'Failed to fetch PSI data');
      }
    } catch (error) {
      console.error('Error fetching PSI data:', error);
      throw error;
    }
  }

  // Fetch PSI data for specific date
  async fetchPSIByDate(date) {
    try {
      const response = await fetch(`${this.baseURL}/psi?date=${date}`);
      const data = await response.json();
      
      if (data.code === 0) {
        return this.processPSIData(data.data);
      } else {
        throw new Error(data.errorMsg || 'Failed to fetch PSI data');
      }
    } catch (error) {
      console.error('Error fetching PSI data by date:', error);
      throw error;
    }
  }

  // Process raw PSI data into usable format
  processPSIData(rawData) {
    const { regionMetadata, items } = rawData;
    
    if (!items || items.length === 0) {
      return null;
    }

    const latestReading = items[0];
    const readings = latestReading.readings;

    // Process regional data
    const regions = ['north', 'south', 'east', 'west', 'central'].map(regionId => {
      const metadata = regionMetadata.find(r => r.name.toLowerCase() === regionId);
      
      return {
        id: regionId,
        name: regionId.charAt(0).toUpperCase() + regionId.slice(1),
        coordinates: metadata ? metadata.labelLocation : null,
        psi: this.getHighestPSI(readings, regionId),
        airQuality: this.calculateAirQuality(readings, regionId),
        pollutants: this.extractPollutants(readings, regionId),
        healthLevel: this.getHealthLevel(this.getHighestPSI(readings, regionId)),
        timestamp: latestReading.timestamp,
        updatedTimestamp: latestReading.updatedTimestamp
      };
    });

    // National data
    const nationalPSI = this.getHighestPSI(readings, 'national');
    
    return {
      national: {
        psi: nationalPSI,
        healthLevel: this.getHealthLevel(nationalPSI),
        airQuality: this.calculateAirQuality(readings, 'national')
      },
      regions,
      timestamp: latestReading.timestamp,
      updatedTimestamp: latestReading.updatedTimestamp,
      date: latestReading.date
    };
  }

  // Get highest PSI value among all pollutants for a region
  getHighestPSI(readings, region) {
    const psiValues = [
      readings.co_sub_index?.[region] || 0,
      readings.so2_sub_index?.[region] || 0,
      readings.no2_one_hour_max?.[region] || 0,
      readings.pm10_sub_index?.[region] || 0,
      readings.pm25_sub_index?.[region] || 0,
      readings.o3_sub_index?.[region] || 0
    ];
    
    return Math.max(...psiValues);
  }

  // Calculate air quality level
  calculateAirQuality(readings, region) {
    return {
      co: readings.co_sub_index?.[region] || 0,
      so2: readings.so2_sub_index?.[region] || 0,
      no2: readings.no2_one_hour_max?.[region] || 0,
      pm10: readings.pm10_sub_index?.[region] || 0,
      pm25: readings.pm25_sub_index?.[region] || 0,
      o3: readings.o3_sub_index?.[region] || 0,
      concentrations: {
        pm25: readings.pm25_twenty_four_hourly?.[region] || 0,
        pm10: readings.pm10_twenty_four_hourly?.[region] || 0,
        so2: readings.so2_twenty_four_hourly?.[region] || 0,
        co: readings.co_eight_hour_max?.[region] || 0
      }
    };
  }

  // Extract pollutant data
  extractPollutants(readings, region) {
    return {
      carbonMonoxide: {
        subIndex: readings.co_sub_index?.[region] || 0,
        eightHourMax: readings.co_eight_hour_max?.[region] || 0,
        unit: 'μg/m³'
      },
      sulphurDioxide: {
        subIndex: readings.so2_sub_index?.[region] || 0,
        twentyFourHourly: readings.so2_twenty_four_hourly?.[region] || 0,
        unit: 'μg/m³'
      },
      nitrogenDioxide: {
        oneHourMax: readings.no2_one_hour_max?.[region] || 0,
        unit: 'μg/m³'
      },
      pm10: {
        subIndex: readings.pm10_sub_index?.[region] || 0,
        twentyFourHourly: readings.pm10_twenty_four_hourly?.[region] || 0,
        unit: 'μg/m³'
      },
      pm25: {
        subIndex: readings.pm25_sub_index?.[region] || 0,
        twentyFourHourly: readings.pm25_twenty_four_hourly?.[region] || 0,
        unit: 'μg/m³'
      },
      ozone: {
        subIndex: readings.o3_sub_index?.[region] || 0,
        unit: 'μg/m³'
      }
    };
  }

  // Get health level based on PSI value
  getHealthLevel(psi) {
    if (psi <= 50) {
      return {
        level: 'Good',
        color: '#00e400',
        description: 'Air quality is satisfactory',
        advice: 'Normal outdoor activities'
      };
    } else if (psi <= 100) {
      return {
        level: 'Moderate',
        color: '#ffff00',
        description: 'Air quality is acceptable',
        advice: 'Unusually sensitive people should limit outdoor exertion'
      };
    } else if (psi <= 200) {
      return {
        level: 'Unhealthy',
        color: '#ff7e00',
        description: 'Everyone may experience health effects',
        advice: 'Limit prolonged outdoor exertion'
      };
    } else if (psi <= 300) {
      return {
        level: 'Very Unhealthy',
        color: '#ff0000',
        description: 'Health warnings of emergency conditions',
        advice: 'Avoid outdoor exertion'
      };
    } else {
      return {
        level: 'Hazardous',
        color: '#8f3f97',
        description: 'Health alert: serious health effects',
        advice: 'Everyone should avoid all outdoor exertion'
      };
    }
  }

  // Get PSI level icon for map display
  getPSIIcon(psi) {
    if (psi <= 50) return '🟢';
    if (psi <= 100) return '🟡';
    if (psi <= 200) return '🟠';
    if (psi <= 300) return '🔴';
    return '🟣';
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export default new PSIService(); 