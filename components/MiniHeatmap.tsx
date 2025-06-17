import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const { width } = Dimensions.get('window');

interface MiniHeatmapProps {
  predictionData?: {
    dengueRisk: { predicted: number; trend: string; confidence: number };
    airQuality: { predictedPSI: number; trend: string; confidence: number };
    covidRisk: { predicted: number; trend: string; confidence: number };
    overallRisk: { level: string; confidence: number };
  };
  locationData?: {
    location: string;
    dengueRisk: { level: string; casesNearby: number };
    airQuality: { psi: number; level: string };
    covidRisk: { level: string; hospitalCases: number };
    overallRisk: string;
  };
  onExpand?: () => void;
}

const MiniHeatmap: React.FC<MiniHeatmapProps> = ({ predictionData, locationData, onExpand }) => {
  const getColorForValue = (value: number, type: string): string => {
    if (type === 'dengue') {
      if (value > 100) return '#F44336';
      if (value > 50) return '#FF9800';
      return '#4CAF50';
    } else if (type === 'air') {
      if (value > 100) return '#F44336';
      if (value > 50) return '#FF9800';
      return '#4CAF50';
    } else if (type === 'covid') {
      if (value > 50) return '#F44336';
      if (value > 25) return '#FF9800';
      return '#4CAF50';
    }
    return '#4CAF50';
  };

  const getRiskColor = (level: string): string => {
    const colors = {
      'Low': '#4CAF50',
      'Medium': '#FF9800',
      'High': '#F44336',
      'Very High': '#8B0000'
    };
    return colors[level as keyof typeof colors] || '#4CAF50';
  };

  const getTrendIcon = (trend: string): JSX.Element => {
    switch (trend) {
      case 'increasing':
        return <FontAwesome5 name="arrow-up" size={8} color="#FF5722" />;
      case 'decreasing':
        return <FontAwesome5 name="arrow-down" size={8} color="#4CAF50" />;
      default:
        return <FontAwesome5 name="minus" size={8} color="#FFC107" />;
    }
  };

  const getLocationInsight = (location: string): string => {
    const loc = location.toLowerCase();
    if (loc.includes('tampines')) return 'Residential town - shopping district';
    if (loc.includes('woodlands')) return 'Northern town - near Malaysia';
    if (loc.includes('bedok')) return 'Residential area - local amenities';
    return `${location} - local area data`;
  };

  const renderPredictionMini = () => {
    if (!predictionData) return null;

    return (
      <View style={styles.miniContainer}>
        <Text style={styles.miniTitle}>
          <FontAwesome5 name="chart-bar" size={12} color="#333" solid /> Prediction Data
        </Text>

        <View style={styles.miniGrid}>
          {/* Dengue */}
          <View style={[
            styles.miniTile,
            { backgroundColor: getColorForValue(predictionData.dengueRisk.predicted, 'dengue') }
          ]}>
            <FontAwesome5 name="bug" size={12} color="#fff" style={styles.miniIcon} solid />
            <Text style={styles.miniValue}>{predictionData.dengueRisk.predicted}</Text>
            <View style={styles.miniTrend}>{getTrendIcon(predictionData.dengueRisk.trend)}</View>
          </View>

          {/* Air Quality */}
          <View style={[
            styles.miniTile,
            { backgroundColor: getColorForValue(predictionData.airQuality.predictedPSI, 'air') }
          ]}>
            <FontAwesome5 name="smog" size={12} color="#fff" style={styles.miniIcon} solid />
            <Text style={styles.miniValue}>{predictionData.airQuality.predictedPSI}</Text>
            <View style={styles.miniTrend}>{getTrendIcon(predictionData.airQuality.trend)}</View>
          </View>

          {/* COVID */}
          <View style={[
            styles.miniTile,
            { backgroundColor: getColorForValue(predictionData.covidRisk.predicted, 'covid') }
          ]}>
            <FontAwesome5 name="hospital" size={12} color="#fff" style={styles.miniIcon} solid />
            <Text style={styles.miniValue}>{predictionData.covidRisk.predicted}</Text>
            <View style={styles.miniTrend}>{getTrendIcon(predictionData.covidRisk.trend)}</View>
          </View>

          {/* Overall */}
          <View style={[
            styles.miniTile,
            { backgroundColor: getRiskColor(predictionData.overallRisk.level) }
          ]}>
            <FontAwesome5 name="chart-bar" size={12} color="#fff" style={styles.miniIcon} solid />
            <Text style={styles.miniValueSmall}>{predictionData.overallRisk.level}</Text>
            <Text style={styles.miniConfidence}>{predictionData.overallRisk.confidence}%</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.expandButton} onPress={onExpand}>
          <Text style={styles.expandText}>
            <FontAwesome5 name="search" size={10} color="#667eea" solid /> View Details
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderLocationMini = () => {
    if (!locationData) return null;

    return (
      <View style={styles.miniContainer}>
        <Text style={styles.miniTitle}>
          <FontAwesome5 name="map-marker-alt" size={12} color="#333" solid /> Hyperlocal Data - {locationData.location}
        </Text>
        <Text style={styles.locationInsight}>{getLocationInsight(locationData.location)}</Text>

        <View style={styles.miniGrid}>
          {/* Dengue Current */}
          <View style={[
            styles.miniTile,
            { backgroundColor: getRiskColor(locationData.dengueRisk.level) }
          ]}>
            <FontAwesome5 name="bug" size={12} color="#fff" style={styles.miniIcon} solid />
            <Text style={styles.miniValue}>{locationData.dengueRisk.casesNearby}</Text>
            <Text style={styles.miniStatus}>{locationData.dengueRisk.level}</Text>
          </View>

          {/* Air Quality Current */}
          <View style={[
            styles.miniTile,
            { backgroundColor: getColorForValue(locationData.airQuality.psi, 'air') }
          ]}>
            <FontAwesome5 name="smog" size={12} color="#fff" style={styles.miniIcon} solid />
            <Text style={styles.miniValue}>{locationData.airQuality.psi}</Text>
            <Text style={styles.miniStatus}>{locationData.airQuality.level}</Text>
          </View>

          {/* COVID Current */}
          <View style={[
            styles.miniTile,
            { backgroundColor: getRiskColor(locationData.covidRisk.level) }
          ]}>
            <FontAwesome5 name="hospital" size={12} color="#fff" style={styles.miniIcon} solid />
            <Text style={styles.miniValue}>{locationData.covidRisk.hospitalCases}</Text>
            <Text style={styles.miniStatus}>{locationData.covidRisk.level}</Text>
          </View>

          {/* Overall Current */}
          <View style={[
            styles.miniTile,
            { backgroundColor: getRiskColor(locationData.overallRisk) }
          ]}>
            <FontAwesome5 name="chart-bar" size={12} color="#fff" style={styles.miniIcon} solid />
            <Text style={styles.miniValueSmall}>{locationData.overallRisk}</Text>
            <Text style={styles.miniStatus}>Risk</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.expandButton} onPress={onExpand}>
          <Text style={styles.expandText}>
            <FontAwesome5 name="chart-bar" size={10} color="#667eea" solid /> View Data Transparency
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View>
      {predictionData && renderPredictionMini()}
      {locationData && renderLocationMini()}
    </View>
  );
};

const styles = StyleSheet.create({
  miniContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  miniTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center'
  },
  locationInsight: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic'
  },
  miniGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8
  },
  miniTile: {
    width: (width * 0.75 - 60) / 4, // Fit 4 tiles in message width
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },
  miniLabel: {
    fontSize: 12,
    marginBottom: 2
  },
  miniValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center'
  },
  miniValueSmall: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center'
  },
  miniTrend: {
    fontSize: 8,
    marginTop: 1
  },
  miniStatus: {
    fontSize: 7,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center'
  },
  miniConfidence: {
    fontSize: 8,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center'
  },
  expandButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginTop: 4
  },
  expandText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  miniIcon: {
    marginBottom: 2,
  },
});

export default MiniHeatmap; 