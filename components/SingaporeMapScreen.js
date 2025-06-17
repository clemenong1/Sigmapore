import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { dengueService, psiService, covidService } from '../stats';
import { Ionicons } from '@expo/vector-icons';

const SingaporeMapScreen = ({ user }) => {
  const [clusters, setClusters] = useState([]);
  const [psiData, setPsiData] = useState(null);
  const [covidData, setCovidData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [mapType, setMapType] = useState('dengue'); // 'dengue', 'psi', or 'covid'
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadDengueData(),
        loadPSIData(),
        loadCovidData()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDengueData = async () => {
    try {
      const clusterData = await dengueService.getDengueClusters();
      setClusters(clusterData);
    } catch (error) {
      console.error('Error loading dengue data:', error);
      Alert.alert('Error', 'Failed to load dengue cluster data');
    }
  };

  const loadPSIData = async () => {
    try {
      const data = await psiService.fetchLatestPSI();
      setPsiData(data);
    } catch (error) {
      console.error('Error loading PSI data:', error);
      Alert.alert('Error', 'Failed to load air quality data');
    }
  };

  const loadCovidData = async () => {
    try {
      const data = await covidService.getCovidCases();
      setCovidData(data);
    } catch (error) {
      console.error('Error loading COVID-19 data:', error);
      Alert.alert('Error', 'Failed to load COVID-19 hospital data');
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

  // Singapore region centers and radius for circular display
  const singaporeRegions = {
    north: {
      center: [1.440, 103.800], // Woodlands/Yishun area
      radius: 0.08 // ~8km radius
    },
    south: {
      center: [1.280, 103.820], // Sentosa/HarbourFront area  
      radius: 0.06 // ~6km radius
    },
    east: {
      center: [1.350, 103.960], // Changi/Tampines area
      radius: 0.08 // ~8km radius
    },
    west: {
      center: [1.340, 103.700], // Jurong/Tuas area
      radius: 0.08 // ~8km radius
    },
    central: {
      center: [1.350, 103.820], // Orchard/Marina Bay area
      radius: 0.06 // ~6km radius
    }
  };

  // Generate HTML for the map
  const generateMapHTML = () => {
    if (mapType === 'dengue') {
      return generateDengueMapHTML();
    } else if (mapType === 'psi') {
      return generatePSIMapHTML();
    } else {
      return generateCovidMapHTML();
    }
  };

  const generateDengueMapHTML = () => {
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Singapore Dengue Clusters Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        html, body, #map { height: 100%; width: 100%; }
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
        // Make map take full height
        document.getElementById('map').style.height = window.innerHeight + 'px';
        
        const map = L.map('map', {
            attributionControl: true,
            zoomControl: true,
            dragging: true,
            tap: true
        }).setView([1.3521, 103.8198], 11);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const clustersData = ${JSON.stringify(clustersGeoJSON)};

        clustersData.features.forEach(function(feature) {
            const coords = feature.geometry.coordinates[0];
            const properties = feature.properties;
            const latlngs = coords.map(coord => [coord[1], coord[0]]);
            
            const polygon = L.polygon(latlngs, {
                color: properties.color,
                fillColor: properties.color,
                fillOpacity: properties.opacity,
                weight: 2
            }).addTo(map);
            
            const popupContent = \`
                <div class="cluster-popup">
                    <div class="popup-title">\${properties.locality}</div>
                    <div class="popup-cases">\${properties.caseSize} cases</div>
                    <div class="popup-date">Updated: \${properties.lastUpdated}</div>
                </div>
            \`;
            
            polygon.bindPopup(popupContent);
        });

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
        
        // Fix for touch events
        setTimeout(function() {
            map.invalidateSize();
        }, 500);
    </script>
</body>
</html>`;
  };

  const generatePSIMapHTML = () => {
    if (!psiData || !psiData.regions) {
      return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>PSI Data Loading</title>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            font-family: Arial, sans-serif; 
        }
    </style>
</head>
<body>
    <div>Loading PSI data...</div>
</body>
</html>`;
    }

    const regionsData = psiData.regions.map(region => {
      const regionConfig = singaporeRegions[region.id];
      return {
        id: region.id,
        name: region.name,
        psi: region.psi,
        healthLevel: region.healthLevel,
        pollutants: region.pollutants,
        timestamp: region.timestamp,
        center: regionConfig ? regionConfig.center : [1.3521, 103.8198],
        radius: regionConfig ? regionConfig.radius : 0.05
      };
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Singapore PSI Air Quality Map</title>
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
        .psi-popup {
            font-family: Arial, sans-serif;
            min-width: 200px;
        }
        .popup-title {
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .popup-psi {
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 4px;
        }
        .popup-level {
            font-size: 12px;
            margin-bottom: 8px;
        }
        .popup-pollutants {
            font-size: 11px;
            color: #6b7280;
        }
        .popup-date {
            color: #6b7280;
            font-size: 10px;
            margin-top: 8px;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <div class="legend">
        <div class="legend-title">Air Quality (PSI)</div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #00e400;"></div>
            <span>Good (0-50)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #ffff00;"></div>
            <span>Moderate (51-100)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #ff7e00;"></div>
            <span>Unhealthy (101-200)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #ff0000;"></div>
            <span>Very Unhealthy (201-300)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: #8f3f97;"></div>
            <span>Hazardous (300+)</span>
        </div>
    </div>

         <script>
         const map = L.map('map').setView([1.3521, 103.8198], 11);
         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
             attribution: '© OpenStreetMap contributors'
         }).addTo(map);
 
         const regionsData = ${JSON.stringify(regionsData)};
 
         regionsData.forEach(function(region) {
             // Convert radius from degrees to meters (approximate)
             const radiusInMeters = region.radius * 111000; // 1 degree ≈ 111km
             
             const circle = L.circle([region.center[0], region.center[1]], {
                 color: region.healthLevel.color,
                 fillColor: region.healthLevel.color,
                 fillOpacity: 0.4,
                 weight: 3,
                 radius: radiusInMeters
             }).addTo(map);
             
             const popupContent = \`
                 <div class="psi-popup">
                     <div class="popup-title">\${region.name} Region</div>
                     <div class="popup-psi" style="color: \${region.healthLevel.color};">
                         PSI: \${region.psi}
                     </div>
                     <div class="popup-level" style="color: \${region.healthLevel.color};">
                         \${region.healthLevel.level} - \${region.healthLevel.description}
                     </div>
                     <div class="popup-pollutants">
                         PM2.5: \${region.pollutants.pm25.subIndex} | 
                         PM10: \${region.pollutants.pm10.subIndex} | 
                         O₃: \${region.pollutants.ozone.subIndex}
                     </div>
                     <div class="popup-date">
                         Updated: \${new Date(region.timestamp).toLocaleString()}
                     </div>
                 </div>
             \`;
             
             circle.bindPopup(popupContent);
         });
          </script>
 </body>
 </html>`;
   };

   const generateCovidMapHTML = () => {
     if (!covidData || covidData.length === 0) {
       return `
 <!DOCTYPE html>
 <html>
 <head>
     <meta charset="utf-8">
     <title>COVID-19 Data Loading</title>
     <style>
         body { 
             margin: 0; 
             padding: 0; 
             display: flex; 
             justify-content: center; 
             align-items: center; 
             height: 100vh; 
             font-family: Arial, sans-serif; 
         }
     </style>
 </head>
 <body>
     <div>Loading COVID-19 hospital data...</div>
 </body>
 </html>`;
     }

     const hospitalData = covidData.map(hospital => ({
       id: hospital.id,
       name: hospital.hospital,
       coordinates: hospital.coordinates,
       totalCases: hospital.totalCases,
       hospitalised: hospital.hospitalised,
       discharged: hospital.discharged,
       riskLevel: hospital.riskLevel,
       color: covidService.getRiskColor(hospital.riskLevel)
     }));

     return `
 <!DOCTYPE html>
 <html>
 <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <title>Singapore COVID-19 Hospital Cases Map</title>
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
             border-radius: 50%;
             border: 2px solid #fff;
             box-shadow: 0 1px 3px rgba(0,0,0,0.3);
         }
         .covid-popup {
             font-family: Arial, sans-serif;
             min-width: 220px;
         }
         .popup-title {
             font-weight: bold;
             color: #1f2937;
             margin-bottom: 8px;
             font-size: 14px;
         }
         .popup-cases {
             font-weight: bold;
             font-size: 16px;
             margin-bottom: 8px;
         }
         .popup-stats {
             font-size: 12px;
             margin-bottom: 4px;
             color: #374151;
         }
         .popup-risk {
             font-size: 12px;
             font-weight: bold;
             padding: 4px 8px;
             border-radius: 4px;
             margin-top: 8px;
         }
     </style>
 </head>
 <body>
     <div id="map"></div>
     <div class="legend">
         <div class="legend-title">COVID-19 Hospital Cases</div>
         <div class="legend-item">
             <div class="legend-color" style="background-color: #8B0000;"></div>
             <span>Very High (30+ cases)</span>
         </div>
         <div class="legend-item">
             <div class="legend-color" style="background-color: #DC143C;"></div>
             <span>High (15-29 cases)</span>
         </div>
         <div class="legend-item">
             <div class="legend-color" style="background-color: #FF8C00;"></div>
             <span>Medium (5-14 cases)</span>
         </div>
         <div class="legend-item">
             <div class="legend-color" style="background-color: #32CD32;"></div>
             <span>Low (1-4 cases)</span>
         </div>
     </div>

     <script>
         const map = L.map('map').setView([1.3521, 103.8198], 11);
         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
             attribution: '© OpenStreetMap contributors'
         }).addTo(map);

         const hospitalData = ${JSON.stringify(hospitalData)};

         hospitalData.forEach(function(hospital) {
             const marker = L.circleMarker([hospital.coordinates[1], hospital.coordinates[0]], {
                 color: '#fff',
                 weight: 2,
                 fillColor: hospital.color,
                 fillOpacity: 0.8,
                 radius: Math.max(8, Math.min(20, hospital.totalCases * 0.5))
             }).addTo(map);
             
             const popupContent = \`
                 <div class="covid-popup">
                     <div class="popup-title">\${hospital.name}</div>
                     <div class="popup-cases" style="color: \${hospital.color};">
                         Total Cases: \${hospital.totalCases}
                     </div>
                     <div class="popup-stats">
                         🏥 Currently Hospitalised: \${hospital.hospitalised}
                     </div>
                     <div class="popup-stats">
                         ✅ Discharged: \${hospital.discharged}
                     </div>
                     <div class="popup-risk" style="background-color: \${hospital.color}; color: white;">
                         Risk Level: \${hospital.riskLevel}
                     </div>
                 </div>
             \`;
             
             marker.bindPopup(popupContent);
         });

         // Fit map to show all hospitals
         if (hospitalData.length > 0) {
             const group = new L.featureGroup();
             hospitalData.forEach(function(hospital) {
                 const marker = L.marker([hospital.coordinates[1], hospital.coordinates[0]]);
                 group.addLayer(marker);
             });
             map.fitBounds(group.getBounds(), { padding: [20, 20] });
         }
     </script>
 </body>
 </html>`;
   };

   const handleMapTypeChange = (type) => {
    setMapType(type);
    setShowDropdown(false);
    setWebViewLoading(true);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading health data...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with dropdown */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setShowDropdown(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownButtonText}>
            {mapType === 'dengue' ? '🦟 Dengue Clusters' : 
             mapType === 'psi' ? '🌫️ Air Quality (PSI)' : 
             '🏥 COVID-19 Cases'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {webViewLoading && (
          <View style={styles.webViewLoading}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.webViewLoadingText}>Loading map...</Text>
          </View>
        )}
        <WebView
          source={{ html: generateMapHTML() }}
          style={styles.webView}
          onLoadEnd={() => setWebViewLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          bounces={false}
          scrollEnabled={true}
          containerStyle={{flex: 1}}
          onError={(e) => console.error('WebView error:', e.nativeEvent)}
          originWhitelist={['*']}
          startInLoadingState={true}
          scalesPageToFit={false}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
        />
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <TouchableOpacity
              style={[styles.dropdownOption, mapType === 'dengue' && styles.selectedOption]}
              onPress={() => handleMapTypeChange('dengue')}
            >
              <Text style={styles.dropdownOptionText}>🦟 Dengue Clusters</Text>
              <Text style={styles.dropdownOptionDesc}>View dengue outbreak areas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.dropdownOption, mapType === 'psi' && styles.selectedOption]}
              onPress={() => handleMapTypeChange('psi')}
            >
              <Text style={styles.dropdownOptionText}>🌫️ Air Quality (PSI)</Text>
              <Text style={styles.dropdownOptionDesc}>View air pollution levels by region</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.dropdownOption, mapType === 'covid' && styles.selectedOption]}
              onPress={() => handleMapTypeChange('covid')}
            >
              <Text style={styles.dropdownOptionText}>🏥 COVID-19 Cases</Text>
              <Text style={styles.dropdownOptionDesc}>View hospital admission locations</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  webView: {
    flex: 1,
    opacity: 0.99, // Fix for touch events on some devices
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  webViewLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 20,
    padding: 8,
    minWidth: 280,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dropdownOption: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
  },
  dropdownOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dropdownOptionDesc: {
    fontSize: 13,
    color: '#666',
  },
});

export default SingaporeMapScreen; 