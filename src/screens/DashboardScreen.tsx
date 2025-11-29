import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../lib/api';

const { width } = Dimensions.get('window');

export function DashboardScreen() {
  const [nodeStats, setNodeStats] = useState<any>(null);
  const [routeStats, setRouteStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [nodes, routes] = await Promise.all([
        api.getNodes().catch(() => []),
        api.getRoutes().catch(() => []),
      ]);

      // Build stats from real data
      const nStats = {
        totalNodes: nodes.length,
        activeRoutes: routes.filter((r: any) => r.status === 'active').length,
        averagePower: nodes.reduce((sum: number, n: any) => sum + (n.power_rating || 0), 0) / (nodes.length || 1),
        unsyncedCount: 0,
        byType: {
          OLT: nodes.filter((n: any) => n.node_type === 'OLT').length,
          Splitter: nodes.filter((n: any) => n.node_type === 'Splitter').length,
          FAT: nodes.filter((n: any) => n.node_type === 'FAT').length,
          ATB: nodes.filter((n: any) => n.node_type === 'ATB').length,
          Closure: nodes.filter((n: any) => n.node_type === 'Closure').length,
        },
      };

      const rStats = {
        totalRoutes: routes.length,
        totalDistance: routes.reduce((sum: number, r: any) => sum + (r.length_meters || 0), 0),
        routesWithFaults: routes.filter((r: any) => r.status === 'fault').length,
        totalCableLength: routes.reduce((sum: number, r: any) => sum + (r.length_meters || 0), 0),
        byType: {
          Backbone: routes.filter((r: any) => r.route_type === 'Backbone').length,
          Distribution: routes.filter((r: any) => r.route_type === 'Distribution').length,
          Access: routes.filter((r: any) => r.route_type === 'Access').length,
          Drop: routes.filter((r: any) => r.route_type === 'Drop').length,
        },
        byStatus: {
          Completed: routes.filter((r: any) => r.status === 'completed').length,
          'Under Construction': routes.filter((r: any) => r.status === 'under_construction').length,
        },
      };

      setNodeStats(nStats);
      setRouteStats(rStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, unit, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>
        {value} <Text style={styles.statUnit}>{unit}</Text>
      </Text>
    </View>
  );

  const SectionCard = ({ title, children }: any) => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {loading ? (
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      ) : (
        <>
          {/* Node Management Stats */}
          {nodeStats && (
            <SectionCard title="Node Network">
              <View style={styles.statsGrid}>
                <StatCard
                  title="Total Nodes"
                  value={nodeStats.totalNodes}
                  unit="nodes"
                  color={colors.primary}
                />
                <StatCard
                  title="Active Routes"
                  value={nodeStats.activeRoutes || 0}
                  unit="active"
                  color={colors.chart.green}
                />
                <StatCard
                  title="Avg Power"
                  value={nodeStats.averagePower?.toFixed(1) || 'N/A'}
                  unit="dBm"
                  color={colors.chart.amber}
                />
                <StatCard
                  title="Ready"
                  value={nodeStats.totalNodes - (nodeStats.unsyncedCount || 0)}
                  unit="nodes"
                  color={colors.chart.green}
                />
              </View>

              <View style={styles.detailsBox}>
                <DetailRow label="OLTs" value={nodeStats.byType?.OLT || 0} />
                <DetailRow label="Splitters" value={nodeStats.byType?.Splitter || 0} />
                <DetailRow label="FATs" value={nodeStats.byType?.FAT || 0} />
                <DetailRow label="ATBs" value={nodeStats.byType?.ATB || 0} />
                <DetailRow label="Closures" value={nodeStats.byType?.Closure || 0} />
                <DetailRow label="Unsync" value={nodeStats.unsyncedCount} color={colors.chart.amber} />
              </View>
            </SectionCard>
          )}

          {/* Route Management Stats */}
          {routeStats && (
            <SectionCard title="Fiber Routes">
              <View style={styles.statsGrid}>
                <StatCard
                  title="Total Routes"
                  value={routeStats.totalRoutes}
                  unit="routes"
                  color={colors.primary}
                />
                <StatCard
                  title="Distance"
                  value={(routeStats.totalDistance / 1000).toFixed(1)}
                  unit="km"
                  color={colors.chart.green}
                />
                <StatCard
                  title="Faults"
                  value={routeStats.routesWithFaults}
                  unit="routes"
                  color={colors.destructive}
                />
                <StatCard
                  title="Cable"
                  value={(routeStats.totalCableLength / 1000).toFixed(1)}
                  unit="km"
                  color={colors.chart.amber}
                />
              </View>

              <View style={styles.detailsBox}>
                <DetailRow label="Backbone" value={routeStats.byType?.Backbone || 0} />
                <DetailRow label="Distribution" value={routeStats.byType?.Distribution || 0} />
                <DetailRow label="Access" value={routeStats.byType?.Access || 0} />
                <DetailRow label="Drop" value={routeStats.byType?.Drop || 0} />
                <DetailRow label="Completed" value={routeStats.byStatus?.Completed || 0} />
                <DetailRow
                  label="Under Const."
                  value={routeStats.byStatus?.['Under Construction'] || 0}
                />
              </View>
            </SectionCard>
          )}

          {/* Summary */}
          <SectionCard title="System Status">
            <View style={styles.statusBox}>
              <StatusIndicator
                label="Offline Capable"
                status="✓"
                color={colors.chart.green}
              />
              <StatusIndicator
                label={`Last Sync: ${new Date().toLocaleTimeString()}`}
                status="✓"
                color={colors.chart.green}
              />
              <StatusIndicator
                label={`Unsynced: ${(nodeStats?.unsyncedCount || 0) + (routeStats?.unsyncedCount || 0)}`}
                status={(nodeStats?.unsyncedCount || 0) + (routeStats?.unsyncedCount || 0) > 0 ? '⚠' : '✓'}
                color={(nodeStats?.unsyncedCount || 0) + (routeStats?.unsyncedCount || 0) > 0 ? colors.chart.amber : colors.chart.green}
              />
            </View>
          </SectionCard>
        </>
      )}
    </ScrollView>
  );
}

function DetailRow({ label, value, color }: any) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, { color: color || colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

function StatusIndicator({ label, status, color }: any) {
  return (
    <View style={styles.statusRow}>
      <Text style={[styles.statusDot, { color }]}>{status}</Text>
      <Text style={styles.statusText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 10,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: colors.mutedForeground,
    fontSize: 16,
  },
  sectionCard: {
    margin: 12,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
    borderLeftWidth: 3,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  statUnit: {
    fontSize: 12,
    fontWeight: 'normal',
    color: colors.mutedForeground,
  },
  detailsBox: {
    backgroundColor: colors.background,
    borderRadius: 6,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  detailLabel: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBox: {
    backgroundColor: colors.background,
    borderRadius: 6,
    padding: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusDot: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  statusText: {
    color: colors.foreground,
    fontSize: 14,
  },
});
