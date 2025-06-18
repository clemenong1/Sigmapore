// Health monitoring services and data exports
export { dengueService } from './services/dengueService';
export { CovidService } from './services/covidService';
export { DENGUE_GEOJSON_DATA } from './data/dengueData';

// Import default instances
import psiServiceDefault from './services/psiService';
import covidServiceDefault from './services/covidService';

// Export instances for easy use
export const psiService = psiServiceDefault;
export const covidService = covidServiceDefault;

// Re-export types if needed
export type { DengueCluster } from './services/dengueService'; 