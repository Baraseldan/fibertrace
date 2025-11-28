import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { colors } from '../theme/colors';
import * as NodeManagement from '../lib/nodeManagement';
import * as RouteManagement from '../lib/routeManagement';
import * as ClosureManagement from '../lib/closureManagement';
import * as SpliceManagement from '../lib/spliceManagement';

type TabType = 'nodes' | 'routes' | 'closures' | 'splices';

export default function InfrastructureHubScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('nodes');

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'nodes', label: 'Nodes', icon: '📡' },
    { key: 'routes', label: 'Routes', icon: '🛤️' },
    { key: 'closures', label: 'Closures', icon: '📦' },
    { key: 'splices', label: 'Splices', icon: '🔗' },
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
        {activeTab === 'nodes' && <NodesTab />}
        {activeTab === 'routes' && <RoutesTab />}
        {activeTab === 'closures' && <ClosuresTab />}
        {activeTab === 'splices' && <SplicesTab />}
      </View>
    </View>
  );
}

function NodesTab() {
  type Node = ReturnType<typeof NodeManagement.createNode>;
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nodeType: 'FAT' as const, label: '', condition: 'new' as const });

  const loadNodes = async () => {
    try {
      const loadedNodes = await NodeManagement.loadNodeDatabase();
      setNodes(loadedNodes);
    } catch (error) {
      console.error('Failed to load nodes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNodes(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNodes();
    setRefreshing(false);
  };

  const handleCreateNode = async () => {
    if (!formData.label.trim()) {
      Alert.alert('Error', 'Please enter a node label');
      return;
    }
    try {
      const nodeId = NodeManagement.suggestNextNodeId(formData.nodeType, nodes);
      const newNode = NodeManagement.createNode({
        nodeType: formData.nodeType,
        nodeId: nodeId,
        label: formData.label,
        condition: formData.condition,
        coordinates: { latitude: 37.78825, longitude: -122.4324 },
      }, 'technician@company.com');
      const updated = [...nodes, newNode];
      await NodeManagement.importNodeDatabase(JSON.stringify(updated));
      setNodes(updated);
      setFormData({ nodeType: 'FAT', label: '', condition: 'new' });
      setShowModal(false);
      Alert.alert('Success', `Node ${newNode.nodeId} created`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create node');
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    Alert.alert('Delete Node', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = nodes.filter(n => String(n.id) !== nodeId);
          await NodeManagement.importNodeDatabase(JSON.stringify(updated));
          setNodes(updated);
        },
      },
    ]);
  };

  const stats = NodeManagement.getNodeStats(nodes);
  const getNodeTypeColor = (type: string) => {
    const colorMap: Record<string, string> = { OLT: colors.chart.green, Splitter: colors.primary, FAT: colors.chart.amber, ATB: colors.accent, Closure: colors.chart.purple };
    return colorMap[type] || colors.primary;
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.statsRow}>
        <StatBubble label="Total" value={stats.totalNodes} color={colors.primary} />
        <StatBubble label="Ready" value={stats.totalNodes - (stats.unsyncedCount || 0)} color={colors.chart.green} />
        <StatBubble label="Unsync" value={stats.unsyncedCount} color={colors.chart.amber} />
      </View>

      <TouchableOpacity style={styles.createButton} onPress={() => setShowModal(true)}>
        <Text style={styles.createButtonText}>+ Create Node</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centerContent}><Text style={styles.loadingText}>Loading nodes...</Text></View>
      ) : nodes.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No nodes yet</Text>
          <Text style={styles.emptySubtext}>Create a node to get started</Text>
        </View>
      ) : (
        <FlatList
          data={nodes}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
          renderItem={({ item: node }) => (
            <TouchableOpacity style={[styles.itemCard, { borderLeftColor: getNodeTypeColor(node.type) }]}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{node.nodeId}</Text>
                <View style={[styles.badge, { backgroundColor: node.condition === 'new' ? colors.chart.green : node.condition === 'damaged' ? colors.destructive : colors.chart.amber }]}>
                  <Text style={styles.badgeText}>{node.condition}</Text>
                </View>
              </View>
              <Text style={styles.itemSubtitle}>{node.label}</Text>
              <Text style={styles.itemMeta}>{node.type}</Text>
              <View style={styles.itemActions}>
                <TouchableOpacity style={[styles.smallButton, { backgroundColor: colors.destructive + '20' }]} onPress={() => handleDeleteNode(String(node.id))}>
                  <Text style={[styles.smallButtonText, { color: colors.destructive }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView style={{ padding: 16 }}>
              <Text style={styles.modalTitle}>Create Node</Text>

              <Text style={styles.label}>Node Type</Text>
              <View style={styles.optionsGrid}>
                {['OLT', 'Splitter', 'FAT', 'ATB', 'Closure'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.optionButton, formData.nodeType === type && styles.optionButtonActive]}
                    onPress={() => setFormData({ ...formData, nodeType: type as any })}
                  >
                    <Text style={[styles.optionButtonText, formData.nodeType === type && styles.optionButtonTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Label</Text>
              <TextInput
                style={styles.input}
                placeholder="Node label"
                placeholderTextColor={colors.mutedForeground}
                value={formData.label}
                onChangeText={text => setFormData({ ...formData, label: text })}
              />

              <Text style={styles.label}>Condition</Text>
              <View style={styles.optionsGrid}>
                {['new', 'good', 'degraded', 'faulty'].map(cond => (
                  <TouchableOpacity
                    key={cond}
                    style={[styles.optionButton, formData.condition === cond && styles.optionButtonActive]}
                    onPress={() => setFormData({ ...formData, condition: cond as any })}
                  >
                    <Text style={[styles.optionButtonText, formData.condition === cond && styles.optionButtonTextActive]}>{cond}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleCreateNode}>
                  <Text style={styles.submitButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function RoutesTab() {
  type Route = ReturnType<typeof RouteManagement.createRouteFromMapPoints>;
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Distribution' as const, cableType: 'G652D' as const, cableSize: '48F' });

  const loadRoutes = async () => {
    try {
      const loaded = await RouteManagement.loadRouteDatabase();
      setRoutes(loaded);
    } catch (error) {
      console.error('Failed to load routes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRoutes(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRoutes();
    setRefreshing(false);
  };

  const handleCreateRoute = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a route name');
      return;
    }
    try {
      const routeId = RouteManagement.suggestNextRouteId(routes);
      const newRoute = RouteManagement.createRouteFromMapPoints(
        {
          name: formData.name,
          type: formData.type,
          routeId,
          startNodeId: 1,
          endNodeId: 2,
          inventory: { cableType: formData.cableType, cableSize: formData.cableSize, totalLength: 1000, reserve: 100, spliceCount: 0 },
        },
        [{ latitude: 37.78825, longitude: -122.4324 }, { latitude: 37.78935, longitude: -122.4324 }],
        'technician@company.com'
      );
      const updated = [...routes, newRoute];
      await RouteManagement.importRouteDatabase(JSON.stringify(updated));
      setRoutes(updated);
      setFormData({ name: '', type: 'Distribution', cableType: 'G652D', cableSize: '48F' });
      setShowModal(false);
      Alert.alert('Success', `Route ${routeId} created`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create route');
    }
  };

  const handleDeleteRoute = (routeId: string) => {
    Alert.alert('Delete Route', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = routes.filter(r => String(r.id) !== routeId);
          await RouteManagement.importRouteDatabase(JSON.stringify(updated));
          setRoutes(updated);
        },
      },
    ]);
  };

  const stats = RouteManagement.getRouteStats(routes);
  const getRouteColor = (type: string) => ({ Backbone: '#0066FF', Distribution: '#FFCC00', Access: '#00CC44', Drop: '#FFFFFF' }[type] || '#CCCCCC');
  const getStatusColor = (status: string) => {
    if (status === 'Completed') return colors.chart.green;
    if (status === 'Under Construction') return colors.chart.amber;
    if (status === 'Faulty') return colors.destructive;
    return colors.mutedForeground;
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.statsRow}>
        <StatBubble label="Total" value={stats.totalRoutes} color={colors.primary} />
        <StatBubble label="Distance" value={`${(stats.totalDistance / 1000).toFixed(1)}km`} color={colors.chart.green} />
        <StatBubble label="Faults" value={stats.routesWithFaults} color={colors.destructive} />
      </View>

      <TouchableOpacity style={styles.createButton} onPress={() => setShowModal(true)}>
        <Text style={styles.createButtonText}>+ Create Route</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centerContent}><Text style={styles.loadingText}>Loading routes...</Text></View>
      ) : routes.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No routes yet</Text>
          <Text style={styles.emptySubtext}>Create a route to get started</Text>
        </View>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
          renderItem={({ item: route }) => (
            <TouchableOpacity style={[styles.itemCard, { borderLeftColor: getRouteColor(route.type) }]}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{route.name}</Text>
                <View style={[styles.badge, { backgroundColor: getStatusColor(route.status) }]}>
                  <Text style={styles.badgeText}>{route.status}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getRouteColor(route.type), marginRight: 6 }} />
                <Text style={styles.itemMeta}>{route.type} • {route.routeId}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Text style={styles.itemMeta}>Distance: {(route.totalDistance / 1000).toFixed(2)}km</Text>
                <Text style={styles.itemMeta}>Cable: {route.inventory.cableSize}</Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity style={[styles.smallButton, { backgroundColor: colors.destructive + '20' }]} onPress={() => handleDeleteRoute(String(route.id))}>
                  <Text style={[styles.smallButtonText, { color: colors.destructive }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView style={{ padding: 16 }}>
              <Text style={styles.modalTitle}>Create Route</Text>

              <Text style={styles.label}>Route Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Main Distribution A"
                placeholderTextColor={colors.mutedForeground}
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
              />

              <Text style={styles.label}>Route Type</Text>
              <View style={styles.optionsGrid}>
                {['Backbone', 'Distribution', 'Access', 'Drop'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.optionButton, formData.type === type && styles.optionButtonActive]}
                    onPress={() => setFormData({ ...formData, type: type as any })}
                  >
                    <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: getRouteColor(type), marginBottom: 4 }} />
                    <Text style={[styles.optionButtonText, formData.type === type && styles.optionButtonTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Cable Type</Text>
              <View style={styles.optionsGrid}>
                {['ADSS', 'G652D', 'G657A', 'G657B'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.optionButton, formData.cableType === type && styles.optionButtonActive]}
                    onPress={() => setFormData({ ...formData, cableType: type as any })}
                  >
                    <Text style={[styles.optionButtonText, formData.cableType === type && styles.optionButtonTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Cable Size</Text>
              <View style={styles.optionsGrid}>
                {['12F', '24F', '48F', '96F'].map(size => (
                  <TouchableOpacity
                    key={size}
                    style={[styles.optionButton, formData.cableSize === size && styles.optionButtonActive]}
                    onPress={() => setFormData({ ...formData, cableSize: size })}
                  >
                    <Text style={[styles.optionButtonText, formData.cableSize === size && styles.optionButtonTextActive]}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleCreateRoute}>
                  <Text style={styles.submitButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ClosuresTab() {
  const [closures, setClosures] = useState<ClosureManagement.Closure[]>([]);
  const [stats, setStats] = useState<ClosureManagement.ClosureStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const loaded = await ClosureManagement.loadClosures();
      setClosures(loaded);
      setStats(ClosureManagement.getClosureStats(loaded));
    } catch (error) {
      console.error('Failed to load closures:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDeleteClosure = (closureId: string) => {
    Alert.alert('Delete Closure', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = closures.filter(c => c.id !== closureId);
          await ClosureManagement.saveClosures(updated);
          setClosures(updated);
          setStats(ClosureManagement.getClosureStats(updated));
        },
      },
    ]);
  };

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
      {loading ? (
        <View style={styles.centerContent}><Text style={styles.loadingText}>Loading closures...</Text></View>
      ) : (
        <>
          {stats && (
            <View style={styles.statsCard}>
              <Text style={styles.sectionTitle}>Closure Network</Text>
              <View style={styles.statsGrid}>
                <StatItem label="Total" value={stats.totalClosures} color={colors.primary} />
                <StatItem label="Active" value={stats.activeClosures} color={colors.chart.green} />
                <StatItem label="Splices" value={stats.totalSplices} color={colors.primary} />
                <StatItem label="High Loss" value={stats.closuresWithHighLoss} color={colors.destructive} />
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Closures ({closures.length})</Text>
            {closures.length === 0 ? (
              <View style={styles.emptyState}><Text style={styles.emptyText}>No closures recorded yet</Text></View>
            ) : (
              closures.map(closure => {
                const avgLoss = ClosureManagement.calculateSpliceLoss(closure.splices);
                return (
                  <View key={closure.id} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <View>
                        <Text style={styles.itemTitle}>{closure.label}</Text>
                        <Text style={styles.itemMeta}>{closure.type} • {closure.closureId}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: closure.status === 'Active' ? colors.chart.green : colors.chart.amber }]}>
                        <Text style={styles.badgeText}>{closure.status}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                      <Text style={styles.itemMeta}>Splices: {closure.splices.length}</Text>
                      <Text style={styles.itemMeta}>Avg Loss: {avgLoss.toFixed(2)} dB</Text>
                      <Text style={styles.itemMeta}>Fibers: {closure.fiberCount}</Text>
                    </View>
                    <View style={styles.itemActions}>
                      <TouchableOpacity style={[styles.smallButton, { backgroundColor: colors.destructive + '20' }]} onPress={() => handleDeleteClosure(closure.id)}>
                        <Text style={[styles.smallButtonText, { color: colors.destructive }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function SplicesTab() {
  const [spliceMaps, setSpliceMaps] = useState<SpliceManagement.SpliceMap[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const loaded = await SpliceManagement.loadSpliceMaps();
      setSpliceMaps(loaded);
    } catch (error) {
      console.error('Failed to load splice maps:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDeleteSpliceMap = (spliceId: string) => {
    Alert.alert('Delete Splice Map', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = spliceMaps.filter(s => s.id !== spliceId);
          await SpliceManagement.saveSpliceMaps(updated);
          setSpliceMaps(updated);
        },
      },
    ]);
  };

  const getTotalStats = () => {
    let totalMappings = 0, totalGood = 0, totalHighLoss = 0, totalFaults = 0;
    spliceMaps.forEach(map => {
      const stats = SpliceManagement.calculateSpliceStatistics(map);
      totalMappings += stats.totalSplices;
      totalGood += stats.goodCount;
      totalHighLoss += stats.highLossCount;
      totalFaults += stats.faultCount;
    });
    return { totalMappings, totalGood, totalHighLoss, totalFaults };
  };

  const stats = getTotalStats();

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
      {loading ? (
        <View style={styles.centerContent}><Text style={styles.loadingText}>Loading splice maps...</Text></View>
      ) : (
        <>
          <View style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Splice Network</Text>
            <View style={styles.statsGrid}>
              <StatItem label="Total Fibers" value={stats.totalMappings} color={colors.primary} />
              <StatItem label="Good" value={stats.totalGood} color={colors.chart.green} />
              <StatItem label="High-Loss" value={stats.totalHighLoss} color={colors.chart.amber} />
              <StatItem label="Faults" value={stats.totalFaults} color={colors.destructive} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Splice Maps ({spliceMaps.length})</Text>
            {spliceMaps.length === 0 ? (
              <View style={styles.emptyState}><Text style={styles.emptyText}>No splice maps recorded yet</Text></View>
            ) : (
              spliceMaps.map(spliceMap => {
                const mapStats = SpliceManagement.calculateSpliceStatistics(spliceMap);
                const healthStatus = mapStats.faultCount > 0 ? 'Critical' : mapStats.highLossCount > 0 ? 'Warning' : 'Healthy';
                const healthColor = healthStatus === 'Healthy' ? colors.chart.green : healthStatus === 'Warning' ? colors.chart.amber : colors.destructive;

                return (
                  <View key={spliceMap.id} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <View>
                        <Text style={styles.itemTitle}>Map: {spliceMap.id.substring(0, 12)}...</Text>
                        <Text style={styles.itemMeta}>{spliceMap.cableInId} → {spliceMap.cableOutId}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: healthColor }]}>
                        <Text style={styles.badgeText}>{healthStatus}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                      <Text style={styles.itemMeta}>Fibers: {mapStats.totalSplices}</Text>
                      <Text style={styles.itemMeta}>Good: {mapStats.goodCount}</Text>
                      <Text style={styles.itemMeta}>Avg Loss: {mapStats.avgLoss.toFixed(2)} dB</Text>
                    </View>
                    <View style={styles.fiberPreview}>
                      {spliceMap.fiberMappings.slice(0, 4).map((mapping: any, idx: number) => (
                        <View key={idx} style={styles.fiberDotRow}>
                          <View style={[styles.fiberDot, { backgroundColor: mapping.status === 'Good' ? colors.chart.green : mapping.status === 'High-Loss' ? colors.chart.amber : colors.destructive }]} />
                          <Text style={styles.fiberDotText}>{mapping.inFiber}→{mapping.outFiber} ({mapping.lossReading.toFixed(2)}dB)</Text>
                        </View>
                      ))}
                      {spliceMap.fiberMappings.length > 4 && (
                        <Text style={[styles.itemMeta, { color: colors.primary }]}>+{spliceMap.fiberMappings.length - 4} more</Text>
                      )}
                    </View>
                    <View style={styles.itemActions}>
                      <TouchableOpacity style={[styles.smallButton, { backgroundColor: colors.destructive + '20' }]} onPress={() => handleDeleteSpliceMap(spliceMap.id)}>
                        <Text style={[styles.smallButtonText, { color: colors.destructive }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function StatBubble({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <View style={[styles.statBubble, { borderColor: color }]}>
      <Text style={styles.statBubbleValue}>{value}</Text>
      <Text style={styles.statBubbleLabel}>{label}</Text>
    </View>
  );
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statItemLabel}>{label}</Text>
      <Text style={[styles.statItemValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabContainer: { flexDirection: 'row', backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 8 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabIcon: { fontSize: 16, marginBottom: 4 },
  tabLabel: { fontSize: 10, color: colors.mutedForeground, fontWeight: '500' },
  tabLabelActive: { color: colors.primary, fontWeight: '600' },
  content: { flex: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 12, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  statBubble: { alignItems: 'center', padding: 8, borderRadius: 8, borderWidth: 2, minWidth: 70 },
  statBubbleValue: { fontSize: 16, fontWeight: '600', color: colors.foreground },
  statBubbleLabel: { fontSize: 10, color: colors.mutedForeground, marginTop: 2 },
  createButton: { margin: 12, padding: 12, backgroundColor: colors.primary, borderRadius: 6, alignItems: 'center' },
  createButtonText: { color: 'white', fontWeight: '600', fontSize: 13 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  loadingText: { color: colors.mutedForeground, fontSize: 14 },
  emptyText: { color: colors.foreground, fontSize: 14, fontWeight: '600' },
  emptySubtext: { color: colors.mutedForeground, fontSize: 12, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 30, backgroundColor: colors.card, borderRadius: 6 },
  itemCard: { backgroundColor: colors.card, borderRadius: 6, borderLeftWidth: 3, padding: 12, marginBottom: 10, borderLeftColor: colors.primary },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemTitle: { fontSize: 13, fontWeight: '600', color: colors.foreground },
  itemSubtitle: { fontSize: 12, color: colors.foreground, marginTop: 2 },
  itemMeta: { fontSize: 10, color: colors.mutedForeground },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: 'white', fontSize: 9, fontWeight: '600' },
  itemActions: { marginTop: 10, flexDirection: 'row', gap: 8 },
  smallButton: { flex: 1, paddingVertical: 8, borderRadius: 4, alignItems: 'center' },
  smallButtonText: { fontSize: 11, fontWeight: '600' },
  fiberPreview: { marginTop: 8, backgroundColor: colors.background, borderRadius: 4, padding: 8 },
  fiberDotRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  fiberDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  fiberDotText: { fontSize: 10, color: colors.mutedForeground },
  section: { paddingHorizontal: 12, paddingVertical: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 12 },
  statsCard: { margin: 12, padding: 16, backgroundColor: colors.card, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: colors.primary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statItem: { width: '48%', padding: 10, backgroundColor: colors.background, borderRadius: 6, marginBottom: 8 },
  statItemLabel: { fontSize: 10, color: colors.mutedForeground, marginBottom: 4 },
  statItemValue: { fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background, borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: colors.foreground, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 10, color: colors.foreground, marginBottom: 12 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  optionButton: { flex: 1, minWidth: 70, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  optionButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionButtonText: { fontSize: 11, color: colors.mutedForeground, fontWeight: '500' },
  optionButtonTextActive: { color: 'white' },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 24 },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 6, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelButtonText: { color: colors.foreground, fontWeight: '600' },
  submitButton: { flex: 1, paddingVertical: 12, borderRadius: 6, backgroundColor: colors.primary, alignItems: 'center' },
  submitButtonText: { color: 'white', fontWeight: '600' },
});
