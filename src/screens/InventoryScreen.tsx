import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../lib/api';

interface InventoryItem {
  id: number;
  item_name: string;
  item_type: string;
  serial_number?: string;
  assigned_to?: number;
  assigned_name?: string;
  status: string;
  condition: string;
  last_calibration?: string;
  next_calibration?: string;
  notes?: string;
}

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newItem, setNewItem] = useState({
    item_name: '',
    item_type: 'Tool',
    serial_number: '',
    condition: 'good',
  });

  const loadInventory = async () => {
    try {
      const response = await api.getInventory();
      setItems(response.items || []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInventory();
    setRefreshing(false);
  };

  const handleAddItem = async () => {
    if (!newItem.item_name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    try {
      await api.createInventoryItem(newItem);
      setShowAddForm(false);
      setNewItem({ item_name: '', item_type: 'Tool', serial_number: '', condition: 'good' });
      loadInventory();
      Alert.alert('Success', 'Item added to inventory');
    } catch (error) {
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const itemTypes = ['Tool', 'OTDR', 'PowerMeter', 'Cleaver', 'Splicer', 'SafetyGear', 'Cable', 'Closure', 'Splitter'];
  const conditions = ['good', 'fair', 'poor', 'damaged', 'lost'];

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.item_type.toLowerCase() === filter.toLowerCase());

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good': return colors.chart.green;
      case 'fair': return colors.chart.amber;
      case 'poor': return colors.chart.orange;
      case 'damaged': return colors.destructive;
      case 'lost': return colors.mutedForeground;
      default: return colors.foreground;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return colors.chart.green;
      case 'in_use': return colors.chart.blue;
      case 'maintenance': return colors.chart.amber;
      case 'lost': return colors.destructive;
      default: return colors.foreground;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text style={styles.addButtonText}>{showAddForm ? '×' : '+'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        <TouchableOpacity
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        {itemTypes.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.filterChip, filter === type.toLowerCase() && styles.filterChipActive]}
            onPress={() => setFilter(type.toLowerCase())}
          >
            <Text style={[styles.filterText, filter === type.toLowerCase() && styles.filterTextActive]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {showAddForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add Inventory Item</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Item Name"
            placeholderTextColor={colors.mutedForeground}
            value={newItem.item_name}
            onChangeText={(text) => setNewItem({ ...newItem, item_name: text })}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Serial Number (optional)"
            placeholderTextColor={colors.mutedForeground}
            value={newItem.serial_number}
            onChangeText={(text) => setNewItem({ ...newItem, serial_number: text })}
          />

          <Text style={styles.labelSmall}>Type:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {itemTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.typeChip, newItem.item_type === type && styles.typeChipActive]}
                onPress={() => setNewItem({ ...newItem, item_type: type })}
              >
                <Text style={[styles.typeText, newItem.item_type === type && styles.typeTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.labelSmall}>Condition:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {conditions.map(cond => (
              <TouchableOpacity
                key={cond}
                style={[styles.typeChip, newItem.condition === cond && styles.typeChipActive]}
                onPress={() => setNewItem({ ...newItem, condition: cond })}
              >
                <Text style={[styles.typeText, newItem.condition === cond && styles.typeTextActive]}>
                  {cond}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.submitButton} onPress={handleAddItem}>
            <Text style={styles.submitButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.list}
      >
        {loading ? (
          <Text style={styles.emptyText}>Loading inventory...</Text>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No inventory items</Text>
            <Text style={styles.emptySubtext}>Add tools and equipment to track</Text>
          </View>
        ) : (
          filteredItems.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.item_name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '30' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              
              <View style={styles.itemDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailValue}>{item.item_type}</Text>
                </View>
                
                {item.serial_number && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>S/N:</Text>
                    <Text style={styles.detailValue}>{item.serial_number}</Text>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Condition:</Text>
                  <Text style={[styles.detailValue, { color: getConditionColor(item.condition) }]}>
                    {item.condition}
                  </Text>
                </View>
                
                {item.assigned_name && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Assigned:</Text>
                    <Text style={styles.detailValue}>{item.assigned_name}</Text>
                  </View>
                )}

                {item.next_calibration && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Calibration Due:</Text>
                    <Text style={styles.detailValue}>{item.next_calibration}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.background,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  filterContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.mutedForeground,
    fontSize: 13,
  },
  filterTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  formCard: {
    margin: 12,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 12,
    color: colors.foreground,
    marginBottom: 12,
  },
  labelSmall: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 6,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeText: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  typeTextActive: {
    color: colors.background,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.background,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    padding: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  detailValue: {
    fontSize: 13,
    color: colors.foreground,
    fontWeight: '500',
  },
});
