import { DENGUE_GEOJSON_DATA } from '../data/dengueData';

export interface DengueCluster {
        id: string;
        locality: string;
        caseSize: number;
        coordinates: Array<[number, number]>; // [longitude, latitude]
        lastUpdated: string;
        center: [number, number]; // calculated center point
        homes?: string;
        publicPlaces?: string;
        constructionSites?: string;
}

class DengueService {
        private clusters: DengueCluster[] = [];
        private isLoaded = false;

        async loadDengueClusters(): Promise<DengueCluster[]> {
                if (this.isLoaded) {
                        return this.clusters;
                }

                try {
                        // Process the GeoJSON data
                        this.clusters = DENGUE_GEOJSON_DATA.features.map((feature: any, index: number) => {
                                const properties = feature.properties;
                                const coordinates = this.extractCoordinates(feature.geometry.coordinates[0]);
                                const center = this.calculateCenter(coordinates);

                                return {
                                        id: `cluster_${properties.OBJECTID || index + 1}`,
                                        locality: properties.LOCALITY || 'Unknown Location',
                                        caseSize: properties.CASE_SIZE || 0,
                                        coordinates,
                                        center,
                                        lastUpdated: this.formatDate(properties.FMEL_UPD_D || ''),
                                        homes: properties.HOMES || undefined,
                                        publicPlaces: properties.PUBLIC_PLACES || undefined,
                                        constructionSites: properties.CONSTRUCTION_SITES || undefined
                                };
                        });

                        this.isLoaded = true;
                        return this.clusters;
                } catch (error) {
                        console.error('Error loading dengue clusters:', error);
                        throw error;
                }
        }

        private extractCoordinates(coordinatesArray: number[][]): Array<[number, number]> {
                return coordinatesArray.map(coord => [coord[0], coord[1]]);
        }

        private calculateCenter(coordinates: Array<[number, number]>): [number, number] {
                if (coordinates.length === 0) return [103.8198, 1.3521]; // Singapore center as fallback

                const sumLng = coordinates.reduce((sum, coord) => sum + coord[0], 0);
                const sumLat = coordinates.reduce((sum, coord) => sum + coord[1], 0);

                return [sumLng / coordinates.length, sumLat / coordinates.length];
        }

        private formatDate(dateString: string): string {
                if (!dateString || dateString.length < 8) return 'Unknown';

                // Format from YYYYMMDDHHMMSS to readable date
                const year = dateString.substring(0, 4);
                const month = dateString.substring(4, 6);
                const day = dateString.substring(6, 8);

                return `${day}/${month}/${year}`;
        }

        async getDengueClusters(): Promise<DengueCluster[]> {
                if (!this.isLoaded) {
                        await this.loadDengueClusters();
                }
                return this.clusters;
        }

        async getTotalCases(): Promise<number> {
                const clusters = await this.getDengueClusters();
                return clusters.reduce((total, cluster) => total + cluster.caseSize, 0);
        }

        async getClusterCount(): Promise<number> {
                const clusters = await this.getDengueClusters();
                return clusters.length;
        }

        async getHighRiskClusters(threshold: number = 10): Promise<DengueCluster[]> {
                const clusters = await this.getDengueClusters();
                return clusters.filter(cluster => cluster.caseSize >= threshold);
        }

        async getClustersByRegion(): Promise<{[region: string]: DengueCluster[]}> {
                const clusters = await this.getDengueClusters();
                const regions: {[region: string]: DengueCluster[]} = {
                        'Central': [],
                        'East': [],
                        'North': [],
                        'West': [],
                        'South': []
                };

                clusters.forEach(cluster => {
                        const [lng, lat] = cluster.center;

                        // Simple region classification based on coordinates
                        if (lng < 103.82) {
                                regions['West'].push(cluster);
                        } else if (lng > 103.9) {
                                regions['East'].push(cluster);
                        } else if (lat > 1.38) {
                                regions['North'].push(cluster);
                        } else if (lat < 1.29) {
                                regions['South'].push(cluster);
                        } else {
                                regions['Central'].push(cluster);
                        }
                });

                return regions;
        }
}

export const dengueService = new DengueService(); 