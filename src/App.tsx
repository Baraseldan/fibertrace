import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MapScreen } from './screens/MapScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { NodeManagementScreen } from './screens/NodeManagementScreen';
import { RouteManagementScreen } from './screens/RouteManagementScreen';
import JobListScreen from './screens/JobListScreen';
import InventoryScreen from './screens/InventoryScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import SearchScreen from './screens/SearchScreen';
import GPSTrackingScreen from './screens/GPSTrackingScreen';
import ReportsScreen from './screens/ReportsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import BluetoothScreen from './screens/BluetoothScreen';
import PerformanceScreen from './screens/PerformanceScreen';
import SettingsScreen from './screens/SettingsScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import SyncStatusScreen from './screens/SyncStatusScreen';
import { colors } from './theme/colors';
import { initializeOfflineStorage } from './lib/offlineStorage';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function AppContent() {
  const [activeTab, setActiveTab] = React.useState('Dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  useEffect(() => {
    initializeOfflineStorage().catch(error => {
      console.error('Failed to initialize offline storage:', error);
    });
  }, []);

  const screens: Record<string, React.ComponentType<any>> = {
    Dashboard: DashboardScreen,
    Map: MapScreen,
    Nodes: NodeManagementScreen,
    Routes: RouteManagementScreen,
    Jobs: JobListScreen,
    Inventory: InventoryScreen,
    Schedule: ScheduleScreen,
    Analytics: AnalyticsScreen,
    Search: SearchScreen,
    GPS: GPSTrackingScreen,
    Reports: ReportsScreen,
    Alerts: NotificationsScreen,
    BT: BluetoothScreen,
    Perf: PerformanceScreen,
    Settings: SettingsScreen,
    Profile: UserProfileScreen,
    Sync: SyncStatusScreen,
  };

  const ActiveScreen = screens[activeTab];
  const tabs = Object.keys(screens);

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.background }}>
      <QueryClientProvider client={queryClient}>
        {/* Collapsible Sidebar */}
        <View style={{
          width: sidebarCollapsed ? 60 : 200,
          backgroundColor: colors.card,
          borderRightWidth: 1,
          borderRightColor: colors.border,
          transition: 'width 0.3s ease',
        }}>
          {/* Toggle Button */}
          <TouchableOpacity
            onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              padding: 16,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 18, color: colors.background, fontWeight: 'bold' }}>
              {sidebarCollapsed ? '☰' : '✕'}
            </Text>
          </TouchableOpacity>

          {/* Navigation Items */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: sidebarCollapsed ? 8 : 16,
                  backgroundColor: activeTab === tab ? colors.primary : 'transparent',
                  borderLeftWidth: activeTab === tab ? 4 : 0,
                  borderLeftColor: colors.primary,
                  alignItems: sidebarCollapsed ? 'center' : 'flex-start',
                }}
              >
                <Text style={{
                  fontSize: sidebarCollapsed ? 10 : 14,
                  color: activeTab === tab ? colors.background : colors.foreground,
                  fontWeight: activeTab === tab ? 'bold' : 'normal',
                }}>
                  {sidebarCollapsed ? tab.slice(0, 2) : tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Content Area */}
        <View style={{ flex: 1 }}>
          {ActiveScreen && <ActiveScreen />}
        </View>
      </QueryClientProvider>
    </View>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
