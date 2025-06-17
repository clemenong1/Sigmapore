import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { dengueService } from '../services/dengueService';

const SingaporeMapScreen = ({ user }) => {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [webViewLoading, setWebViewLoading] = useState(true);

  useEffect(() => {
    loadDengueData();
  }, []);

  const loadDengueData = async () => {
    try {
      const clusterData = await dengueService.getDengueClusters();
      setClusters(clusterData);
    } catch (error) {
      console.error('Error loading dengue data:', error);
      Alert.alert('Error', 'Failed to load dengue cluster data');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (caseSize) => {
    if (caseSize >= 20) return '#dc2626'; // Very High - Red
    if (caseSize >= 10) return '#ea580c'; // High - Orange
    if (caseSize >= 5) return '#d97706';  // Medium - Yellow
    return '#16a34a'; // Low - Green
  };

  const getRiskOpacity = (caseSize) => {
    if (caseSize >= 20) return 0.8;
    if (caseSize >= 10) return 0.7;
    if (caseSize >= 5) return 0.6;
    return 0.5;
  };

  // Generate HTML for the map with dengue clusters
  const generateMapHTML = () => {
    const clustersGeoJSON = {
      type: "FeatureCollection",
      features: clusters.map(cluster => ({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [cluster.coordinates]
        },
        properties: {
          id: cluster.id,
          locality: cluster.locality,
          caseSize: cluster.caseSize,
          lastUpdated: cluster.lastUpdated,
          color: getRiskColor(cluster.caseSize),
          opacity: getRiskOpacity(cluster.caseSize)
        }
      }))
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Singapore Dengue Clusters Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        #map { height: 100vh; width: 100%; }
        .legend {
            position: absolute;
            bottom: 30px;
            right: 10px;
            background: rgba(255, 255, 255, 0.95);
            padding: 15px;
            border-radius: 8px;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 1000;
        }
        .legend-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        .legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 6px;
        }
        .legend-color {
            width: 18px;
            height: 18px;
            margin-right: 8px;
            border-radius: 3px;
            border: 1px solid #ccc;
        }
        .cluster-popup {
            font-family: Arial, sans-serif;
        }
        .popup-title {
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .popup-cases {
            color: #dc2626;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 4px;
        }
        .popup-date {
            color: #6b7280;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <div class="legend">
        <div class="legend-title">Dengue Risk Levels</div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #dc2626;"></div>
            <span>Very High (20+ cases)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #ea580c;"></div>
            <span>High (10-19 cases)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #d97706;"></div>
            <span>Medium (5-9 cases)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #16a34a;"></div>
            <span>Low (1-4 cases)</span>
        </div>
    </div>

    <script>
        // Initialize the map centered on Singapore
        const map = L.map('map').setView([1.3521, 103.8198], 11);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const clustersData = ${JSON.stringify(clustersGeoJSON)};

        // Add dengue clusters to the map
        clustersData.features.forEach(function(feature) {
            const coords = feature.geometry.coordinates[0];
            const properties = feature.properties;
            
            // Convert coordinates for Leaflet (lat, lng format)
            const latlngs = coords.map(coord => [coord[1], coord[0]]);
            
            // Create polygon
            const polygon = L.polygon(latlngs, {
                color: properties.color,
                fillColor: properties.color,
                fillOpacity: properties.opacity,
                weight: 2
            }).addTo(map);
            
            // Add popup
            const popupContent = \`
                <div class="cluster-popup">
                    <div class="popup-title">\${properties.locality}</div>
                    <div class="popup-cases">\${properties.caseSize} cases</div>
                    <div class="popup-date">Updated: \${properties.lastUpdated}</div>
                </div>
            \`;
            
            polygon.bindPopup(popupContent);
        });

        // Fit map to show all clusters
        if (clustersData.features.length > 0) {
            const group = new L.featureGroup();
            clustersData.features.forEach(function(feature) {
                const coords = feature.geometry.coordinates[0];
                const latlngs = coords.map(coord => [coord[1], coord[0]]);
                const polygon = L.polygon(latlngs);
                group.addLayer(polygon);
            });
            map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
    </script>
</body>
</html>
    `;
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0D1421', '#1A237E']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading dengue map data...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Title */}
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Singapore Dengue Map</Text>
        <Text style={styles.subtitle}>Tap on colored areas for details • {clusters.length} active clusters</Text>
      </View>

      {webViewLoading && (
        <View style={styles.webViewLoadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.webViewLoadingText}>Loading map...</Text>
        </View>
      )}
      
      <WebView
        source={{ html: generateMapHTML() }}
        style={styles.webView}
        onLoadStart={() => setWebViewLoading(true)}
        onLoadEnd={() => setWebViewLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1421',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#B0BEC5',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#0D1421',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#B0BEC5',
    textAlign: 'center',
  },
  webView: {
    flex: 1,
  },
  webViewLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 20, 33, 0.9)',
    zIndex: 1000,
  },
  webViewLoadingText: {
    color: '#4CAF50',
    fontSize: 16,
    marginTop: 16,
  },
});

export default SingaporeMapScreen; 