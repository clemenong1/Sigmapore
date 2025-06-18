import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const { width } = Dimensions.get('window');

interface HealthDataPoint {
  region: string;
  dengueRisk: number;
  psiLevel: number;
  covidRisk: number;
  overallRisk: number;
  coordinates?: { lat: number; lng: number };
}

interface HeatmapProps {
  locationAnalysis: {
    location: string;
    dengueRisk: { level: string; casesNearby: number };
    airQuality: { psi: number; level: string };
    covidRisk: { level: string; hospitalCases: number };
    overallRisk: string;
  };
  regionalData?: {
    regions: Array<{
      name: string;
      dengueRisk: { level: string; casesNearby: number };
      airQuality: { psi: number; level: string };
      covidRisk: { level: string; hospitalCases: number };
      overallRisk: string;
    }>;
  };
  onClose: () => void;
}

const HealthDataHeatmap: React.FC<HeatmapProps> = ({ locationAnalysis, regionalData, onClose }) => {
  const [selectedMetric, setSelectedMetric] = useState<'dengue' | 'air' | 'covid' | 'overall'>('overall');
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  // Determine which data to show: regional data (for Singapore-wide queries) or hyperlocal data (for specific locations)
  const displayData: HealthDataPoint[] = regionalData ? 
    // Convert regional data for display
    regionalData.regions.map(region => ({
      region: region.name,
      dengueRisk: region.dengueRisk.casesNearby,
      psiLevel: region.airQuality.psi,
      covidRisk: region.covidRisk.hospitalCases,
      overallRisk: getRiskScore(region.overallRisk),
      coordinates: { lat: 1.3, lng: 103.8 } // Generic coordinates for regional data
    })) :
    // Show specific location's hyperlocal data
    [
      {
        region: locationAnalysis.location,
        dengueRisk: locationAnalysis.dengueRisk.casesNearby,
        psiLevel: locationAnalysis.airQuality.psi,
        covidRisk: locationAnalysis.covidRisk.hospitalCases,
        overallRisk: getRiskScore(locationAnalysis.overallRisk),
        coordinates: { lat: 1.3, lng: 103.8 } // Will be replaced with actual coordinates if available
      }
    ];

  function getRiskScore(risk: string): number {
    switch (risk) {
      case 'High': return 80;
      case 'Medium': return 50;
      case 'Low': return 20;
      default: return 30;
    }
  }

  const getMetricValue = (region: HealthDataPoint): number => {
    switch (selectedMetric) {
      case 'dengue': return region.dengueRisk;
      case 'air': return region.psiLevel;
      case 'covid': return region.covidRisk;
      case 'overall': return region.overallRisk;
      default: return region.overallRisk;
    }
  };

  const getColorForValue = (value: number, metric: string): string => {
    if (metric === 'air') {
      // PSI color scale
      if (value <= 50) return '#00e400';
      if (value <= 100) return '#ffff00';
      if (value <= 200) return '#ff7e00';
      if (value <= 300) return '#ff0000';
      return '#8f3f97';
    } else {
      // Risk percentage scale
      if (value <= 30) return '#4CAF50';
      if (value <= 50) return '#FF9800';
      if (value <= 70) return '#FF5722';
      return '#F44336';
    }
  };

  const renderHeatmapGrid = () => {
    const isRegionalView = !!regionalData;
    const titleText = isRegionalView ? 
      "Singapore Regional Health Data" : 
      `GPS-Precise Health Data - ${locationAnalysis.location}`;

    return (
      <View style={styles.heatmapContainer}>
        <Text style={styles.heatmapTitle}>{titleText}</Text>

        <View style={styles.gridContainer}>
          {displayData.map((locationData: HealthDataPoint, index: number) => {
            const value = getMetricValue(locationData);
            const color = getColorForValue(value, selectedMetric);

            return (
              <Animated.View
                key={locationData.region}
                style={[
                  styles.regionTile,
                  {
                    width: isRegionalView ? width * 0.4 : width * 0.8, // Regional: smaller tiles, Hyperlocal: single wide tile
                    backgroundColor: color,
                    opacity: animatedValue,
                    transform: [{
                      scale: animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1]
                      })
                    }]
                  }
                ]}
              >
                <Text style={styles.regionName}>{locationData.region}</Text>
                <Text style={styles.regionValue}>
                  {selectedMetric === 'air' ? `${Math.round(value)} PSI` : 
                   selectedMetric === 'dengue' ? `${Math.round(value)} cases` :
                   selectedMetric === 'covid' ? `${Math.round(value)} cases` :
                   `${Math.round(value)}% risk`}
                </Text>
                <Text style={styles.regionStatus}>
                  {getRiskLabel(value, selectedMetric)}
                </Text>
              </Animated.View>
            );
          })}
        </View>
      </View>
    );
  };

  const getRiskLabel = (value: number, metric: string): string => {
    if (metric === 'air') {
      if (value <= 50) return 'Good';
      if (value <= 100) return 'Moderate';
      if (value <= 200) return 'Unhealthy';
      return 'Hazardous';
    } else {
      if (value <= 30) return 'Low Risk';
      if (value <= 50) return 'Medium Risk';
      if (value <= 70) return 'High Risk';
      return 'Very High';
    }
  };

  const renderDataBreakdown = () => {
    const isRegionalView = !!regionalData;

    if (isRegionalView) {
      // Regional breakdown for Singapore-wide predictions
      return (
        <View style={styles.dataBreakdown}>
          <Text style={styles.breakdownTitle}>
            <FontAwesome5 name="chart-bar" size={16} color="#333" solid /> Singapore Regional Health Breakdown
          </Text>

          {regionalData!.regions.map((region, index) => (
            <View key={region.name} style={styles.regionBreakdown}>
              <Text style={styles.regionBreakdownTitle}>
                <FontAwesome5 name="map-marker-alt" size={12} color="#6366f1" solid /> {region.name} Region
              </Text>
              
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Dengue:</Text>
                <Text style={styles.dataValue}>{region.dengueRisk.casesNearby} predicted cases ({region.dengueRisk.level})</Text>
              </View>
              
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Air Quality:</Text>
                <Text style={styles.dataValue}>PSI {region.airQuality.psi} ({region.airQuality.level})</Text>
              </View>
              
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>COVID:</Text>
                <Text style={styles.dataValue}>{region.covidRisk.hospitalCases} predicted cases ({region.covidRisk.level})</Text>
              </View>
              
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Overall Risk:</Text>
                <Text style={[styles.dataValue, { color: getColorForValue(getRiskScore(region.overallRisk), 'overall') }]}>
                  {region.overallRisk}
                </Text>
              </View>
            </View>
          ))}

          {/* Regional Data Transparency */}
          <View style={styles.gpsTransparency}>
            <Text style={styles.gpsTitle}>
              <FontAwesome5 name="chart-line" size={14} color="#6366f1" solid /> Regional Prediction Methodology:
            </Text>
            <Text style={styles.gpsText}>• AI-powered regional health forecasting</Text>
            <Text style={styles.gpsText}>• Based on mathematical models and historical patterns</Text>
            <Text style={styles.gpsText}>• Regional variations account for geography and demographics</Text>
            <Text style={styles.gpsText}>• Updated: {new Date().toLocaleString()}</Text>
          </View>
        </View>
      );
    } else {
      // Hyperlocal breakdown for specific locations
      return (
        <View style={styles.dataBreakdown}>
          <Text style={styles.breakdownTitle}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#333" solid /> Hyperlocal Data for {locationAnalysis.location}
          </Text>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>
              <FontAwesome5 name="bug" size={14} color="#dc2626" solid /> Dengue Cases:
            </Text>
            <Text style={styles.dataValue}>{locationAnalysis.dengueRisk.casesNearby} cases within 2km radius</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>
              <FontAwesome5 name="smog" size={14} color="#6b7280" solid /> Air Quality:
            </Text>
            <Text style={styles.dataValue}>PSI {locationAnalysis.airQuality.psi} ({locationAnalysis.airQuality.level}) - GPS-interpolated</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>
              <FontAwesome5 name="hospital" size={14} color="#1d4ed8" solid /> COVID Risk:
            </Text>
            <Text style={styles.dataValue}>{locationAnalysis.covidRisk.hospitalCases} cases in nearby hospitals</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>
              <FontAwesome5 name="chart-line" size={14} color="#333" solid /> Overall Risk:
            </Text>
            <Text style={[styles.dataValue, { color: getColorForValue(getRiskScore(locationAnalysis.overallRisk), 'overall') }]}>
              {locationAnalysis.overallRisk} Risk Level
            </Text>
          </View>

          {/* GPS Data Transparency */}
          <View style={styles.gpsTransparency}>
            <Text style={styles.gpsTitle}>
              <FontAwesome5 name="satellite" size={14} color="#6366f1" solid /> Data Source Transparency:
            </Text>
            <Text style={styles.gpsText}>• GPS-precise analysis for this specific location</Text>
            <Text style={styles.gpsText}>• Dengue: Distance-weighted from 23 active clusters</Text>
            <Text style={styles.gpsText}>• Air Quality: Interpolated from 5 monitoring stations</Text>
            <Text style={styles.gpsText}>• COVID: Hospital proximity-based assessment</Text>
            <Text style={styles.gpsText}>• Updated: {new Date().toLocaleString()}</Text>
          </View>
        </View>
      );
    }
  };

  const renderMetricSelector = () => {
    const metrics = [
      { key: 'overall', label: 'Overall', icon: 'chart-bar' },
      { key: 'dengue', label: 'Dengue', icon: 'bug' },
      { key: 'air', label: 'Air Quality', icon: 'smog' },
      { key: 'covid', label: 'COVID', icon: 'hospital' }
    ];

    return (
      <ScrollView horizontal style={styles.metricSelector} showsHorizontalScrollIndicator={false}>
        {metrics.map((metric) => (
          <TouchableOpacity
            key={metric.key}
            style={[
              styles.metricButton,
              selectedMetric === metric.key && styles.selectedMetricButton
            ]}
            onPress={() => setSelectedMetric(metric.key as any)}
          >
            <FontAwesome5
              name={metric.icon}
              size={18}
              color={selectedMetric === metric.key ? '#fff' : '#667eea'}
              solid
            />
            <Text style={[
              styles.metricLabel,
              selectedMetric === metric.key && styles.selectedMetricLabel
            ]}>
              {metric.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderRecommendations = () => {
    return (
      <View style={styles.recommendationsContainer}>
        <Text style={styles.recommendationsTitle}>
          <FontAwesome5 name="lightbulb" size={16} color="#333" solid /> Health Recommendations
        </Text>
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationText}>
            Based on the current health data for {locationAnalysis.location}, we recommend:
          </Text>
          <View style={styles.recommendationItem}>
            <FontAwesome5 name="check-circle" size={14} color="#4CAF50" style={styles.recommendationIcon} solid />
            <Text style={styles.recommendationItemText}>
              {locationAnalysis.dengueRisk.level === 'High' ? 'Use mosquito repellent when outdoors' : 'Normal mosquito precautions'}
            </Text>
          </View>
          <View style={styles.recommendationItem}>
            <FontAwesome5 name="check-circle" size={14} color="#4CAF50" style={styles.recommendationIcon} solid />
            <Text style={styles.recommendationItemText}>
              {locationAnalysis.airQuality.psi > 100 ? 'Wear a mask outdoors if sensitive to air pollution' : 'Air quality is acceptable for outdoor activities'}
            </Text>
          </View>
          <View style={styles.recommendationItem}>
            <FontAwesome5 name="check-circle" size={14} color="#4CAF50" style={styles.recommendationIcon} solid />
            <Text style={styles.recommendationItemText}>
              {locationAnalysis.covidRisk.level === 'High' ? 'Practice social distancing in crowded areas' : 'Standard hygiene practices recommended'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Health Data Heatmap</Text>
          <Text style={styles.locationText}>{locationAnalysis.location}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.content}>
          {renderMetricSelector()}
          {renderHeatmapGrid()}
          {renderDataBreakdown()}

          <View style={styles.legend}>
            <Text style={styles.legendTitle}>
              <FontAwesome5 name="palette" size={16} color="#333" solid /> Color Legend:
            </Text>
            <View style={styles.legendRow}>
              <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Low Risk / Good</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.legendText}>Medium Risk / Moderate</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendColor, { backgroundColor: '#FF5722' }]} />
              <Text style={styles.legendText}>High Risk / Unhealthy</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendText}>Very High / Hazardous</Text>
            </View>
          </View>

          {renderRecommendations()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D1421'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  locationText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 10
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    paddingHorizontal: 15
  },
  dataBreakdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333'
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1
  },
  dataValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'right'
  },
  metricSelector: {
    marginVertical: 10
  },
  metricButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  selectedMetricButton: {
    backgroundColor: '#667eea'
  },
  metricIcon: {
    fontSize: 20,
    marginBottom: 5
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'
  },
  selectedMetricLabel: {
    color: '#FFFFFF'
  },
  heatmapContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  heatmapTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  regionTile: {
    width: width * 0.4,
    height: 100,
    borderRadius: 10,
    padding: 10,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4
  },
  regionName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center'
  },
  regionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 5
  },
  regionStatus: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2
  },
  legend: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10
  },
  legendText: {
    fontSize: 14,
    color: '#666'
  },
  recommendationsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333'
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  recommendationIcon: {
    marginRight: 10
  },
  recommendationItemText: {
    fontSize: 14,
    color: '#333'
  },
  gpsTransparency: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1'
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  gpsText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 3,
    lineHeight: 16
  },
  regionBreakdown: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  regionBreakdownTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 8
  }
});

export default HealthDataHeatmap; 