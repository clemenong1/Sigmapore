import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
  onClose: () => void;
}

const HealthDataHeatmap: React.FC<HeatmapProps> = ({ locationAnalysis, onClose }) => {
  const [selectedMetric, setSelectedMetric] = useState<'dengue' | 'air' | 'covid' | 'overall'>('overall');
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  // Simulate Singapore regions data (in real app, this would come from your services)
  const regionsData: HealthDataPoint[] = [
    {
      region: 'North',
      dengueRisk: locationAnalysis.dengueRisk.casesNearby > 30 ? 80 : 40,
      psiLevel: locationAnalysis.airQuality.psi,
      covidRisk: locationAnalysis.covidRisk.hospitalCases > 20 ? 60 : 30,
      overallRisk: getRiskScore(locationAnalysis.overallRisk),
      coordinates: { lat: 1.4, lng: 103.8 }
    },
    {
      region: 'South',
      dengueRisk: 35,
      psiLevel: locationAnalysis.airQuality.psi - 10,
      covidRisk: 25,
      overallRisk: 40,
      coordinates: { lat: 1.28, lng: 103.84 }
    },
    {
      region: 'East',
      dengueRisk: 45,
      psiLevel: locationAnalysis.airQuality.psi + 5,
      covidRisk: 35,
      overallRisk: 50,
      coordinates: { lat: 1.35, lng: 103.95 }
    },
    {
      region: 'West',
      dengueRisk: 30,
      psiLevel: locationAnalysis.airQuality.psi - 5,
      covidRisk: 20,
      overallRisk: 35,
      coordinates: { lat: 1.35, lng: 103.7 }
    },
    {
      region: 'Central',
      dengueRisk: 55,
      psiLevel: locationAnalysis.airQuality.psi + 10,
      covidRisk: 45,
      overallRisk: 60,
      coordinates: { lat: 1.29, lng: 103.85 }
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
    return (
      <View style={styles.heatmapContainer}>
        <Text style={styles.heatmapTitle}>Singapore Health Data - {selectedMetric.toUpperCase()}</Text>
        
        <View style={styles.gridContainer}>
          {regionsData.map((region, index) => {
            const value = getMetricValue(region);
            const color = getColorForValue(value, selectedMetric);
            
            return (
              <Animated.View
                key={region.region}
                style={[
                  styles.regionTile,
                  {
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
                <Text style={styles.regionName}>{region.region}</Text>
                <Text style={styles.regionValue}>
                  {selectedMetric === 'air' ? `${Math.round(value)} PSI` : `${Math.round(value)}%`}
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
    return (
      <View style={styles.dataBreakdown}>
        <Text style={styles.breakdownTitle}>📊 Recommendation Based On:</Text>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>🦟 Dengue Cases:</Text>
          <Text style={styles.dataValue}>{locationAnalysis.dengueRisk.casesNearby} cases nearby</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>🌬️ Air Quality:</Text>
          <Text style={styles.dataValue}>PSI {locationAnalysis.airQuality.psi} ({locationAnalysis.airQuality.level})</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>🏥 COVID Hospitals:</Text>
          <Text style={styles.dataValue}>{locationAnalysis.covidRisk.hospitalCases} cases in area hospitals</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>📈 Overall Assessment:</Text>
          <Text style={[styles.dataValue, { color: getColorForValue(getRiskScore(locationAnalysis.overallRisk), 'overall') }]}>
            {locationAnalysis.overallRisk} Risk
          </Text>
        </View>
      </View>
    );
  };

  const renderMetricSelector = () => {
    const metrics = [
      { key: 'overall', label: 'Overall', icon: '📊' },
      { key: 'dengue', label: 'Dengue', icon: '🦟' },
      { key: 'air', label: 'Air Quality', icon: '🌬️' },
      { key: 'covid', label: 'COVID', icon: '🏥' }
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
            <Text style={styles.metricIcon}>{metric.icon}</Text>
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Health Data Transparency</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {renderDataBreakdown()}
        {renderMetricSelector()}
        {renderHeatmapGrid()}
        
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>🎨 Color Legend:</Text>
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
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
  }
});

export default HealthDataHeatmap; 