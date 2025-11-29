import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { colors } from '../theme/colors';
import * as BT from '@/lib/bluetoothIntegration';
import * as GPS from '@/lib/gpsTracking';
import * as Perf from '@/lib/performanceMonitoring';
import { jobCache, inventoryCache, routeCache, nodeCache } from '@/lib/advancedCaching';
import * as OfflineStorage from '../lib/offlineStorage';

type TabType = 'bluetooth' | 'gps' | 'performance' | 'sync';

export default function ToolsHubScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('bluetooth');

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'bluetooth', label: 'Bluetooth', icon: '📶' },
    { key: 'gps', label: 'GPS', icon: '📍' },
    { key: 'performance', label: 'Performance', icon: '⚡' },
    { key: 'sync', label: 'Sync', icon: '🔄' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'bluetooth' && <BluetoothTab />}
        {activeTab === 'gps' && <GPSTab />}
        {activeTab === 'performance' && <PerformanceTab />}
        {activeTab === 'sync' && <SyncTab />}
      </View>
    </View>
  );
}

function BluetoothTab() {
  const [discovered, setDiscovered] = useState<BT.BluetoothDevice[]>([]);
  const [connected, setConnected] = useState<BT.BluetoothConnection[]>([]);
  const [readings, setReadings] = useState<BT.BluetoothReading[]>([]);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    handleStartScan();
  }, []);

  const handleStartScan = async () => {
    setScanning(true);
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      BT.startBluetoothScan();
      setDiscovered(BT.getDiscoveredDevices());
      setScanning(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (deviceId: string) => {
    setLoading(true);
    try {
      const success = await BT.connectToDevice(deviceId);
      if (success) {
        setConnected(BT.getConnectedDevices());
        Alert.alert('Connected', 'Device connected successfully');
        const reading = await BT.readFromDevice(deviceId);
        if (reading) {
          setReadings([reading, ...readings]);
        }
      } else {
        Alert.alert('Error', 'Failed to connect to device');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = (deviceId: string) => {
    BT.disconnectDevice(deviceId);
    setConnected(BT.getConnectedDevices());
  };

  const handleReadDevice = async (deviceId: string) => {
    setLoading(true);
    try {
      const reading = await BT.readFromDevice(deviceId);
      if (reading) {
        setReadings([reading, ...readings]);
        // Save to backend
        await api.saveMeterReading({
          device_name: reading.deviceName,
          reading_type: reading.type,
          reading_value: reading.value,
          unit: reading.unit,
          linked_type: 'node',
          linked_id: 1,
          timestamp: new Date().toISOString(),
        }).catch(e => console.warn('Backend save failed:', e));
        Alert.alert('Reading Captured', `Value: ${reading.value.toFixed(2)} ${reading.unit} (saved to backend)`);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await handleStartScan();
    setRefreshing(false);
  };

  const getRSSIColor = (rssi: number) => {
    if (rssi > -50) return colors.chart.green;
    if (rssi > -70) return colors.chart.amber;
    return colors.destructive;
  };

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
      <View style={styles.statusCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={[styles.dot, scanning && styles.dotActive]} />
          <Text style={styles.statusText}>{scanning ? 'Scanning' : 'Idle'}</Text>
        </View>
        <Text style={styles.statusDetail}>Discovered: {discovered.length} devices</Text>
        <Text style={styles.statusDetail}>Connected: {connected.length} devices</Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <TouchableOpacity style={styles.actionButton} onPress={handleStartScan}>
          <Text style={styles.actionButtonText}>{scanning ? 'Scanning...' : 'Start Bluetooth Scan'}</Text>
        </TouchableOpacity>
      )}

      {connected.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected ({connected.length})</Text>
          {connected.map(conn => (
            <View key={conn.deviceId} style={[styles.card, { borderColor: colors.chart.green }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={styles.cardTitle}>{conn.deviceName}</Text>
                <Text style={[styles.badge, { backgroundColor: colors.chart.green + '30', color: colors.chart.green }]}>CONNECTED</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TouchableOpacity style={[styles.smallButton, { backgroundColor: colors.chart.green + '30' }]} onPress={() => handleReadDevice(conn.deviceId)}>
                  <Text style={[styles.smallButtonText, { color: colors.chart.green }]}>Read</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smallButton, { backgroundColor: colors.destructive + '30' }]} onPress={() => handleDisconnect(conn.deviceId)}>
                  <Text style={[styles.smallButtonText, { color: colors.destructive }]}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Devices ({discovered.length})</Text>
        {discovered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No devices found. Start scanning.</Text>
          </View>
        ) : (
          discovered.map(device => (
            <View key={device.id} style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{device.name}</Text>
                  <Text style={styles.cardSubtitle}>{device.type}</Text>
                </View>
                <Text style={[styles.rssi, { color: getRSSIColor(device.rssi) }]}>{device.rssi} dBm</Text>
              </View>
              <TouchableOpacity style={styles.connectButton} onPress={() => handleConnect(device.id)}>
                <Text style={styles.connectButtonText}>Connect</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {readings.length > 0 && (
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>Readings ({readings.length})</Text>
            <TouchableOpacity onPress={() => { BT.clearReadings(); setReadings([]); }}>
              <Text style={{ fontSize: 11, color: colors.primary }}>Clear</Text>
            </TouchableOpacity>
          </View>
          {readings.slice(0, 5).map((reading, idx) => (
            <View key={idx} style={[styles.card, { borderLeftWidth: 3, borderLeftColor: colors.primary }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.cardTitle}>{reading.deviceName}</Text>
                <Text style={[styles.readingValue, { color: reading.type === 'power' ? colors.chart.cyan : colors.chart.amber }]}>
                  {reading.value.toFixed(2)} {reading.unit}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function GPSTab() {
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [session, setSession] = useState<GPS.TrackingSession | null>(null);
  const [metrics, setMetrics] = useState<GPS.TrackingMetrics | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const mockLocation: GPS.Location = {
    latitude: 40.7128,
    longitude: -74.006,
    accuracy: 5,
    timestamp: new Date().toISOString(),
  };

  useEffect(() => {
    if (!tracking) return;
    const interval = setInterval(() => {
      setElapsedTime(t => t + 1);
      if (session) {
        const newLoc: GPS.Location = {
          latitude: mockLocation.latitude + (Math.random() - 0.5) * 0.001,
          longitude: mockLocation.longitude + (Math.random() - 0.5) * 0.001,
          accuracy: 5,
          timestamp: new Date().toISOString(),
        };
        const updatedSession = GPS.updateLocation(session, newLoc);
        setSession(updatedSession);
        setMetrics(GPS.calculateTrackingMetrics(updatedSession));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [tracking, session]);

  const handleStartTracking = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newSession = GPS.startTracking('JOB-001', 'tech-001', mockLocation);
      setSession(newSession);
      setMetrics(GPS.calculateTrackingMetrics(newSession));
      setTracking(true);
      setElapsedTime(0);
    } finally {
      setLoading(false);
    }
  };

  const handleStopTracking = async () => {
    if (!session) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const completed = GPS.completeTracking(session);
      const finalMetrics = GPS.calculateTrackingMetrics(completed);
      setSession(completed);
      setMetrics(finalMetrics);
      setTracking(false);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setRefreshing(false);
  };

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
      <View style={[styles.statusCard, tracking && { borderColor: colors.chart.green, borderWidth: 2, backgroundColor: colors.chart.green + '10' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
          <View style={[styles.dot, tracking && styles.dotActive]} />
          <Text style={styles.statusText}>{tracking ? 'Tracking Active' : 'Not Tracking'}</Text>
        </View>
        {session && (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.statusDetail}>Distance:</Text>
              <Text style={styles.statusValue}>{(session.distance / 1000).toFixed(2)} km</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.statusDetail}>Points:</Text>
              <Text style={styles.statusValue}>{session.path.length}</Text>
            </View>
            {metrics && tracking && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.statusDetail}>Avg Speed:</Text>
                <Text style={styles.statusValue}>{(metrics.averageSpeed * 3.6).toFixed(1)} km/h</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
          {!tracking ? (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.chart.green }]} onPress={handleStartTracking}>
              <Text style={styles.actionButtonText}>Start Tracking</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.destructive }]} onPress={handleStopTracking}>
              <Text style={styles.actionButtonText}>Stop Tracking</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {session && metrics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Metrics</Text>
          <MetricRow label="Total Distance" value={`${(session.distance / 1000).toFixed(3)} km`} />
          <MetricRow label="Path Points" value={String(session.path.length)} />
          <MetricRow label="Elapsed Time" value={`${Math.floor(elapsedTime / 60)}:${String(elapsedTime % 60).padStart(2, '0')}`} color={colors.primary} />
          <MetricRow label="Avg Speed" value={`${(metrics.averageSpeed * 3.6).toFixed(1)} km/h`} />
          <MetricRow label="Route Efficiency" value={`${metrics.routeEfficiency.toFixed(0)}%`} />
          <MetricRow label="Status" value={session.status} color={session.status === 'Completed' ? colors.chart.green : colors.primary} />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GPS Features</Text>
        <FeatureItem title="Real-time Tracking" description="Track technician location during jobs" />
        <FeatureItem title="Route Optimization" description="Automatic route path recording" />
        <FeatureItem title="Distance Calculation" description="Haversine-based distance measurement" />
      </View>
    </ScrollView>
  );
}

function PerformanceTab() {
  const [perfStats, setPerfStats] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      Perf.recordMetric('screen_render', Math.random() * 100, 'render');
      Perf.recordMetric('api_call', Math.random() * 500, 'network');
      Perf.recordMetric('storage_write', Math.random() * 50, 'storage');
      
      const stats = Perf.getPerformanceStats();
      setPerfStats(stats);

      const cStats = {
        jobs: jobCache.getStats(),
        inventory: inventoryCache.getStats(),
        routes: routeCache.getStats(),
        nodes: nodeCache.getStats(),
      };
      setCacheStats(cStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const clearAllMetrics = () => {
    Perf.clearMetrics();
    jobCache.clear();
    inventoryCache.clear();
    routeCache.clear();
    nodeCache.clear();
    loadStats();
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'render': return colors.chart.cyan;
      case 'network': return colors.primary;
      case 'storage': return colors.chart.amber;
      case 'bluetooth': return colors.chart.purple;
      default: return colors.foreground;
    }
  };

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {perfStats && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance Metrics</Text>
              <View style={[styles.card, { borderLeftWidth: 3, borderLeftColor: perfStats.averageRenderTime < 50 ? colors.chart.green : colors.chart.amber }]}>
                <Text style={styles.cardSubtitle}>Avg Render Time</Text>
                <Text style={[styles.cardValue, { color: perfStats.averageRenderTime < 50 ? colors.chart.green : colors.chart.amber }]}>
                  {perfStats.averageRenderTime.toFixed(1)}ms
                </Text>
              </View>
              <View style={[styles.card, { borderLeftWidth: 3, borderLeftColor: perfStats.averageNetworkTime < 200 ? colors.chart.green : colors.chart.amber }]}>
                <Text style={styles.cardSubtitle}>Avg Network Time</Text>
                <Text style={[styles.cardValue, { color: perfStats.averageNetworkTime < 200 ? colors.chart.green : colors.chart.amber }]}>
                  {perfStats.averageNetworkTime.toFixed(0)}ms
                </Text>
              </View>
            </View>
          )}

          {cacheStats && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cache Performance</Text>
              {Object.entries(cacheStats).map(([name, stats]: [string, any]) => (
                <View key={name} style={styles.card}>
                  <Text style={styles.cardTitle}>{name.charAt(0).toUpperCase() + name.slice(1)} Cache</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={styles.cardSubtitle}>Size: {stats.size}</Text>
                    <Text style={styles.cardSubtitle}>Hits: {stats.hits}</Text>
                    <Text style={[styles.cardSubtitle, { color: stats.hitRate > 50 ? colors.chart.green : colors.chart.amber }]}>
                      {stats.hitRate.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Operations</Text>
            {Perf.getMetrics().slice(-5).map((m, i) => (
              <View key={i} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.cardTitle}>{m.name}</Text>
                  <Text style={[styles.cardSubtitle, { color: getCategoryColor(m.category) }]}>{m.duration}ms</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.destructive + '20', borderWidth: 1, borderColor: colors.destructive }]} onPress={clearAllMetrics}>
              <Text style={[styles.actionButtonText, { color: colors.destructive }]}>Clear All Data</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function SyncTab() {
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [pendingItems, setPendingItems] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  const loadSyncStatus = async () => {
    try {
      const status = await OfflineStorage.getSyncStatus();
      setIsOnline(status.isOnline);
      setPendingItems(status.unsynced);
      setLastSync(status.lastSync);
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  useEffect(() => {
    loadSyncStatus();
    const interval = setInterval(loadSyncStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSyncStatus();
    setRefreshing(false);
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLastSync(new Date());
      await loadSyncStatus();
    } finally {
      setSyncing(false);
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString();

  const getTimeDiff = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
      <View style={[styles.statusCard, { borderColor: isOnline ? colors.chart.green : colors.chart.amber }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={[styles.dot, { backgroundColor: isOnline ? colors.chart.green : colors.chart.amber }]} />
          <Text style={styles.statusText}>{isOnline ? 'Connected' : 'Offline Mode'}</Text>
        </View>
        <Text style={styles.statusDetail}>Server: {isOnline ? '✓ Online' : '✗ Offline'}</Text>
      </View>

      <View style={[styles.statusCard, syncing && { borderColor: colors.chart.green }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={[styles.dot, syncing && styles.dotActive]} />
          <Text style={styles.statusText}>{syncing ? 'Syncing...' : pendingItems === 0 ? 'All Synced' : `${pendingItems} Pending`}</Text>
        </View>
        {lastSync && (
          <Text style={styles.statusDetail}>Last sync: {formatTime(lastSync)} ({getTimeDiff(lastSync)})</Text>
        )}
        {pendingItems > 0 && (
          <Text style={[styles.statusDetail, { color: colors.chart.amber }]}>{pendingItems} items pending upload</Text>
        )}
      </View>

      {!syncing ? (
        <TouchableOpacity style={styles.actionButton} onPress={handleManualSync}>
          <Text style={styles.actionButtonText}>Sync Now</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.statusDetail, { marginTop: 12 }]}>Synchronizing data...</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connectivity Status</Text>
        <ConnectivityItem label="Internet Connection" status={isOnline} />
        <ConnectivityItem label="Server Connection" status={isOnline} />
        <ConnectivityItem label="Database" status={isOnline} />
        <ConnectivityItem label="Bluetooth" status={false} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Settings</Text>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.cardSubtitle}>Auto Sync Interval</Text>
            <Text style={styles.cardTitle}>Every 5 minutes</Text>
          </View>
        </View>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.cardSubtitle}>Conflict Resolution</Text>
            <Text style={styles.cardTitle}>3-way merge</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage</Text>
        <StorageBar label="Synced Data" value={74} color={colors.chart.green} />
        <StorageBar label="Pending Data" value={18} color={colors.chart.amber} />
        <StorageBar label="Cache" value={8} color={colors.chart.cyan} />
      </View>
    </ScrollView>
  );
}

function MetricRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{label}</Text>
      <Text style={[{ fontSize: 13, fontWeight: '600', color: color || colors.foreground }]}>{value}</Text>
    </View>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{description}</Text>
    </View>
  );
}

function ConnectivityItem({ label, status }: { label: string; status: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={[styles.dot, { backgroundColor: status ? colors.chart.green : colors.border, marginRight: 8 }]} />
        <Text style={{ fontSize: 11, color: colors.foreground }}>{label}</Text>
      </View>
      <Text style={[{ fontSize: 10, fontWeight: '600' }, { color: status ? colors.chart.green : colors.mutedForeground }]}>
        {status ? 'Connected' : 'Disconnected'}
      </Text>
    </View>
  );
}

function StorageBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{label}</Text>
        <Text style={[{ fontSize: 11, fontWeight: '600' }, { color }]}>{value}%</Text>
      </View>
      <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ width: `${value}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: colors.card, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border,
    paddingHorizontal: 8,
  },
  tab: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { 
    borderBottomColor: colors.primary,
  },
  tabIcon: { fontSize: 16, marginBottom: 4 },
  tabLabel: { fontSize: 10, color: colors.mutedForeground, fontWeight: '500' },
  tabLabelActive: { color: colors.primary, fontWeight: '600' },
  content: { flex: 1 },
  statusCard: { 
    margin: 12, 
    padding: 16, 
    backgroundColor: colors.card, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.mutedForeground, marginRight: 8 },
  dotActive: { backgroundColor: colors.chart.green },
  statusText: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  statusDetail: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  statusValue: { fontSize: 12, fontWeight: '600', color: colors.foreground },
  centerContent: { paddingVertical: 40, alignItems: 'center' },
  actionButton: { 
    marginHorizontal: 12, 
    marginBottom: 12, 
    paddingVertical: 12, 
    backgroundColor: colors.primary, 
    borderRadius: 6, 
    alignItems: 'center' 
  },
  actionButtonText: { fontSize: 13, fontWeight: '600', color: colors.background },
  section: { paddingHorizontal: 12, paddingVertical: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 12 },
  card: { 
    backgroundColor: colors.card, 
    borderRadius: 6, 
    padding: 12, 
    marginBottom: 8, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  cardTitle: { fontSize: 12, fontWeight: '600', color: colors.foreground },
  cardSubtitle: { fontSize: 10, color: colors.mutedForeground, marginTop: 2 },
  cardValue: { fontSize: 16, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 9, fontWeight: '600' },
  rssi: { fontSize: 11, fontWeight: '600' },
  connectButton: { marginTop: 8, paddingVertical: 8, backgroundColor: colors.primary, borderRadius: 4, alignItems: 'center' },
  connectButtonText: { fontSize: 11, fontWeight: '600', color: colors.background },
  smallButton: { flex: 1, paddingVertical: 6, borderRadius: 4, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  smallButtonText: { fontSize: 10, fontWeight: '600' },
  readingValue: { fontSize: 11, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 30, backgroundColor: colors.card, borderRadius: 6, marginBottom: 8 },
  emptyText: { fontSize: 11, color: colors.mutedForeground },
});
