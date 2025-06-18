import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const mapStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0D1421',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  map: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 8,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  fabIcon: {
    fontSize: 24,
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  markerContainer: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF5722',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,

  zoomControls: {
    position: 'absolute',
    right: 15,
    bottom: 160,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999,
  },
  zoomButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    width: 50,
    height: 50,
  },
  markerContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,

  },
});

export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#999',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 50,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  locationContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  cancelButtonText: {
    color: '#666',
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e9ecef',
    backgroundColor: 'white',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#666',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownList: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 5,
    maxHeight: 200,
  },
  dropdownOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
  },
});

export const markerStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 20,
    color: 'white',
  },
  callout: {
    width: 250,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  calloutTime: {
    fontSize: 12,
    color: '#999',
  },
});

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  citySkylne: {
    marginBottom: 40,
  },
  skylineText: {
    fontSize: 40,
    textAlign: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  authToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 3,
    marginBottom: 30,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  toggleText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#1976D2',
  },
});

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: '#B0BEC5',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 3,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeTabText: {
    color: '#1976D2',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  logoutText: {
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '600',
  },
});

// Main styles for all screens
export const styles = StyleSheet.create({
  // Common screen styles
  screenContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#B0BEC5',
  },

  // Profile/Info Screen styles
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    color: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#B0BEC5',
  },
  profileSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  editButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0BEC5',
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  fieldInput: {
    fontSize: 16,
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 8,
  },
  addressInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fieldNote: {
    fontSize: 12,
    color: '#90A4AE',
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Report Screen styles
  reportHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  reportSubtitle: {
    fontSize: 14,
    color: '#B0BEC5',
    textAlign: 'center',
    lineHeight: 20,
  },
  locationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#B0BEC5',
    marginLeft: 8,
  },
  locationButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  locationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 80) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategoryCard: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  categoryIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#B0BEC5',
    textAlign: 'center',
    lineHeight: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#B0BEC5',
    textAlign: 'right',
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recentReportCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  recentReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recentReportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  recentReportTime: {
    fontSize: 12,
    color: '#B0BEC5',
  },
  recentReportDescription: {
    fontSize: 14,
    color: '#B0BEC5',
    lineHeight: 18,
    marginBottom: 8,
  },
  recentReportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentReportStatus: {
    fontSize: 12,
    color: '#FFB74D',
    fontWeight: '600',
  },
  recentReportCategory: {
    fontSize: 20,
  },

  // Bottom Navigation styles
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13, 20, 33, 0.95)',
    paddingTop: 12,
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  activeNavItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
    color: '#B0BEC5',
  },
  activeNavIcon: {
    color: '#4CAF50',
  },
  navLabel: {
    fontSize: 12,
    color: '#B0BEC5',
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#4CAF50',
    fontWeight: '600',
  },

  // Dashboard styles (from original App.tsx)
  dashboardContainer: {
    flex: 1,
  },
  dashboardContent: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 14,
    color: '#B0BEC5',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#B0BEC5',
    marginTop: 5,
  },
  districtsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  districtCard: {
    width: (width - 45) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  districtHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  districtIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  districtName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  buildingContainer: {
    alignItems: 'center',
    height: 100,
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  building: {
    width: 40,
    borderRadius: 5,
    marginBottom: 5,
  },
  percentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  description: {
    fontSize: 12,
    color: '#B0BEC5',
    textAlign: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  logoutText: {
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 5,
  },

  // Auth Screen styles (from original App.tsx)
  loginContainer: {
    flex: 1,
  },
  loginContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  citySkylne: {
    marginBottom: 40,
  },
  skylineText: {
    fontSize: 40,
    textAlign: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  enterButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  enterButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 3,
    marginBottom: 30,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeToggleText: {
    color: '#1976D2',
  },
  disabledButton: {
    opacity: 0.6,
  },
  countryDropdownWrapper: {
    marginBottom: 15,
  },
  countryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 10,
  },
  countryInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  countryArrow: {
    fontSize: 12,
    color: '#666',
  },
  countryArrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  countryDropdown: {
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: 200,
    marginTop: 5,
  },
  countryOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  countryOptionText: {
    fontSize: 16,
    color: '#333',
  },
  lastCountryOption: {
    borderBottomWidth: 0,
  },

  // New styles from the code block
  liveStatsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  liveStatsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF5722',
    marginBottom: 10,
    letterSpacing: 1,
  },
  livePopulationNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  liveStatsSubtitle: {
    fontSize: 14,
    color: '#B0BEC5',
  },

  // Population Stats Styles
  populationContainer: {
    margin: 15,
    marginTop: 0,
  },
  populationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  populationNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    letterSpacing: 1,
  },
  populationLabel: {
    fontSize: 16,
    color: '#B0BEC5',
    textAlign: 'center',
  },

  todayStatsContainer: {
    margin: 15,
    marginTop: 0,
  },
  todayStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  todayStatCard: {
    width: (width - 45) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  todayStatIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  todayStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  todayStatLabel: {
    fontSize: 12,
    color: '#B0BEC5',
    textAlign: 'center',
  },
  healthOverviewContainer: {
    margin: 15,
    marginTop: 0,
  },
  demographicsContainer: {
    margin: 15,
    marginTop: 0,
  },
  genderStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  genderIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  genderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  genderLabel: {
    fontSize: 12,
    color: '#B0BEC5',
    textAlign: 'center',
  },
  chartContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: 'rgba(13, 20, 33, 0.7)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 220,
  },
  noDataText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },

  // Quiz Screen Styles
  quizContainer: {
    flex: 1,
    padding: 20,
  },
  quizHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  quizTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
  },
  quizTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizSubtitle: {
    fontSize: 16,
    color: '#B0BEC5',
    textAlign: 'center',
  },
  quizStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  quizStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  quizStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  quizStatLabel: {
    fontSize: 12,
    color: '#B0BEC5',
    textAlign: 'center',
  },
  quizCompletedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 40,
    marginTop: 20,
  },
  quizCompletedIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  quizCompletedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 10,
  },
  quizCompletedText: {
    fontSize: 16,
    color: '#B0BEC5',
    textAlign: 'center',
    marginBottom: 20,
  },
  quizCompletedSubtext: {
    fontSize: 14,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 10,
  },
  quizCompletedResult: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  quizQuestionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  quizQuestion: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 30,
    paddingHorizontal: 10,
  },
  quizAnswersContainer: {
    marginBottom: 30,
  },
  quizAnswerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 70,
    justifyContent: 'center',
  },
  quizAnswerButtonSelected: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
  },
  quizAnswerButtonCorrect: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: '#4CAF50',
  },
  quizAnswerButtonIncorrect: {
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
    borderColor: '#F44336',
  },
  quizAnswerText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  quizAnswerTextSelected: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  quizSubmitButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  quizSubmitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quizSubmittingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  quizSubmittingText: {
    color: '#4CAF50',
    fontSize: 16,
    marginLeft: 10,
  },

  // Quiz Header Styles
  quizHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  leaderboardButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  leaderboardButtonIcon: {
    fontSize: 24,
  },

  // Leaderboard Modal Styles
  leaderboardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardContainer: {
    width: '95%',
    height: '85%',
    borderRadius: 20,
    padding: 20,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  leaderboardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardSubtitle: {
    fontSize: 16,
    color: '#B0BEC5',
    textAlign: 'center',
    marginBottom: 20,
  },
  leaderboardCloseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  leaderboardLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardLoadingText: {
    color: '#B0BEC5',
    fontSize: 16,
    marginTop: 15,
  },
  leaderboardList: {
    flex: 1,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  leaderboardItemTopThree: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  leaderboardItemCurrentUser: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  leaderboardRank: {
    width: 50,
    alignItems: 'center',
  },
  leaderboardRankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  leaderboardRankTextTopThree: {
    fontSize: 24,
  },
  leaderboardUserInfo: {
    flex: 1,
    marginLeft: 15,
  },
  leaderboardUsername: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  leaderboardUsernameTopThree: {
    color: '#FFD700',
  },
  leaderboardUsernameCurrentUser: {
    color: '#4CAF50',
  },
  leaderboardUserStats: {
    fontSize: 14,
    color: '#B0BEC5',
  },
  leaderboardPoints: {
    alignItems: 'center',
  },
  leaderboardPointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  leaderboardPointsTextTopThree: {
    color: '#FFD700',
    fontSize: 24,
  },
  leaderboardPointsLabel: {
    fontSize: 12,
    color: '#B0BEC5',
  },
  leaderboardEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  leaderboardEmptyText: {
    fontSize: 18,
    color: '#B0BEC5',
    textAlign: 'center',
    marginBottom: 10,
  },
  leaderboardEmptySubtext: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
}); 