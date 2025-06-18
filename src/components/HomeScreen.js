import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    Dimensions,
    SafeAreaView,
} from 'react-native';
import { styles } from '../styles/styles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { LineChart } from 'react-native-chart-kit';
import { LanguageContext, getLivePopulationData } from '../../App';

const { width } = Dimensions.get('window');

const HomeScreen = ({ user }) => {
    const { language, translations } = useContext(LanguageContext);
    const t = translations[language] || translations.english;

    const [populationData, setPopulationData] = useState(getLivePopulationData());

    const [healthStats, setHealthStats] = useState({
        dengueCases: 245,
        airQuality: 'Good',
        hospitalLoad: 32,
        weeklyDengue: 103,
        avgPsi: 52
    });

    const [weeklyDengueData, setWeeklyDengueData] = useState([30, 29, 13, 17, 8, 6, 0]);
    const [weeklyDengueLabels, setWeeklyDengueLabels] = useState(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);

    // Update population data every 10 seconds using the live function
    useEffect(() => {
        const interval = setInterval(() => {
            setPopulationData(getLivePopulationData());
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const formatNumber = (num) => num.toLocaleString('en-SG');

    // Render dengue chart component
    const renderDengueChart = () => {
        const chartData = {
            labels: weeklyDengueLabels,
            datasets: [{
                data: weeklyDengueData,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                strokeWidth: 3
            }]
        };

        const chartConfig = {
            backgroundColor: '#0D1421',
            backgroundGradientFrom: '#0D1421',
            backgroundGradientTo: '#0D1421',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#4CAF50'
            },
            fillShadowGradientOpacity: 0.3,
            fillShadowGradient: '#4CAF50',
        };

        return (
            <View style={{ margin: 16 }}>
                <Text style={styles.sectionTitle}>
                    <FontAwesome5 name="chart-bar" size={18} color="#4CAF50" solid /> {t.dengueTrend}
                </Text>
                <View style={[styles.chartContainer, { alignItems: 'center', justifyContent: 'center' }]}>
                    <LineChart
                        data={chartData}
                        width={width - 62}
                        height={220}
                        chartConfig={{
                            ...chartConfig,
                            propsForLabels: { fontSize: 10 }
                        }}
                        bezier
                        style={{
                            marginVertical: 0,
                            borderRadius: 12,
                        }}
                        withInnerLines={true}
                        withOuterLines={true}
                        withVerticalLines={true}
                        withHorizontalLines={true}
                        withDots={true}
                        withShadow={true}
                        segments={5}
                    />
                </View>
            </View>
        );
    };

    return (
        <ScrollView
            style={styles.dashboardContent}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.welcomeText}>{t.welcome}, {user?.displayName || 'User'}</Text>
                <Text style={styles.dashboardTitle}>{t.healthPulse}</Text>
                <Text style={styles.tagline}>{t.tagline}</Text>
            </View>

            {/* Population Stats */}
            <View style={styles.populationContainer}>
                <Text style={styles.sectionTitle}>
                    <FontAwesome5 name="users" size={18} color="#4CAF50" solid /> {t.populationStats}
                </Text>
                <View style={styles.populationCard}>
                    <Text style={styles.populationNumber}>{formatNumber(populationData.currentPopulation)}</Text>
                    <Text style={styles.populationLabel}>{t.totalPopulation}</Text>
                </View>
            </View>

            {/* Today's Statistics */}
            <View style={styles.todayStatsContainer}>
                <Text style={styles.sectionTitle}>
                    <FontAwesome5 name="chart-bar" size={18} color="#4CAF50" solid /> {t.todayStatistics}
                </Text>
                <View style={styles.todayStatsGrid}>
                    <View style={styles.todayStatCard}>
                        <FontAwesome5 name="baby" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
                        <Text style={styles.todayStatNumber}>{populationData.today.births}</Text>
                        <Text style={styles.todayStatLabel}>{t.birthsToday}</Text>
                    </View>
                    <View style={styles.todayStatCard}>
                        <FontAwesome5 name="dove" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
                        <Text style={styles.todayStatNumber}>{populationData.today.deaths}</Text>
                        <Text style={styles.todayStatLabel}>{t.deathsToday}</Text>
                    </View>
                    <View style={styles.todayStatCard}>
                        <FontAwesome5 name="plane" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
                        <Text style={styles.todayStatNumber}>{populationData.today.migration}</Text>
                        <Text style={styles.todayStatLabel}>{t.netMigration}</Text>
                    </View>
                    <View style={styles.todayStatCard}>
                        <FontAwesome5 name="chart-line" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
                        <Text style={styles.todayStatNumber}>{populationData.today.growth}</Text>
                        <Text style={styles.todayStatLabel}>{t.populationGrowth}</Text>
                    </View>
                </View>
            </View>

            {/* Health Overview */}
            <View style={styles.todayStatsContainer}>
                <Text style={styles.sectionTitle}>
                    <FontAwesome5 name="hospital" size={18} color="#4CAF50" solid /> {t.healthOverview}
                </Text>
                <View style={styles.todayStatsGrid}>
                    <View style={styles.todayStatCard}>
                        <FontAwesome5 name="virus" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
                        <Text style={styles.todayStatNumber}>{healthStats.dengueCases}</Text>
                        <Text style={styles.todayStatLabel}>{t.activeDengueCases}</Text>
                    </View>
                    <View style={styles.todayStatCard}>
                        <FontAwesome5 name="wind" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
                        <Text style={styles.todayStatNumber}>{healthStats.airQuality}</Text>
                        <Text style={styles.todayStatLabel}>{t.airQuality}</Text>
                    </View>
                    <View style={styles.todayStatCard}>
                        <FontAwesome5 name="heartbeat" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
                        <Text style={styles.todayStatNumber}>{formatNumber(populationData.additionalStats.lifeExpectancy)}</Text>
                        <Text style={styles.todayStatLabel}>{t.lifeExpectancy}</Text>
                    </View>
                </View>
            </View>

            {/* Weekly Dengue & Avg PSI Stats */}
            <View style={styles.todayStatsContainer}>
                <Text style={styles.sectionTitle}>
                    <FontAwesome5 name="chart-line" size={18} color="#4CAF50" solid /> {t.dengueAvgPsi}
                </Text>
                <View style={styles.todayStatsGrid}>
                    <View style={styles.todayStatCard}>
                        <FontAwesome5 name="bug" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
                        <Text style={styles.todayStatNumber}>{healthStats.weeklyDengue}</Text>
                        <Text style={styles.todayStatLabel}>{t.dengueCases}</Text>
                    </View>
                    <View style={styles.todayStatCard}>
                        <FontAwesome5 name="globe-asia" size={24} color="#4CAF50" style={styles.todayStatIcon} solid />
                        <Text style={styles.todayStatNumber}>{healthStats.avgPsi}</Text>
                        <Text style={styles.todayStatLabel}>{t.avgPsi}</Text>
                    </View>
                </View>
            </View>

            {/* Dengue Trend Chart */}
            {renderDengueChart()}

            {/* Total Dengue Cases */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                paddingHorizontal: 15,
                marginBottom: 15
            }}>
                <View style={{
                    width: (width - 45) / 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: 15,
                    borderRadius: 12,
                    alignItems: 'center',
                }}>
                    <FontAwesome5 name="chart-pie" size={24} color="#4CAF50" style={{ marginBottom: 8 }} solid />
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#4CAF50', marginBottom: 4 }}>{healthStats.weeklyDengue}</Text>
                    <Text style={{ fontSize: 12, color: '#B0BEC5', textAlign: 'center' }}>{t.totalDengueCases}</Text>
                </View>
            </View>

            {/* Demographics */}
            <View style={styles.demographicsContainer}>
                <Text style={styles.sectionTitle}>
                    <FontAwesome5 name="users" size={18} color="#4CAF50" solid /> {t.demographics}
                </Text>
                <View style={styles.genderStats}>
                    <View style={styles.genderCard}>
                        <FontAwesome5 name="male" size={24} color="#4CAF50" style={styles.genderIcon} solid />
                        <Text style={styles.genderNumber}>{formatNumber(populationData.demographics.male.population)}</Text>
                        <Text style={styles.genderLabel}>{t.male} ({populationData.demographics.male.percentage}%)</Text>
                    </View>
                    <View style={styles.genderCard}>
                        <FontAwesome5 name="female" size={24} color="#4CAF50" style={styles.genderIcon} solid />
                        <Text style={styles.genderNumber}>{formatNumber(populationData.demographics.female.population)}</Text>
                        <Text style={styles.genderLabel}>{t.female} ({populationData.demographics.female.percentage}%)</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default HomeScreen; 