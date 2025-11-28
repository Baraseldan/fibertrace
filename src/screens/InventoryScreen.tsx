import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import * as Inventory from '@/lib/inventoryManagement';

export default function InventoryScreen() {
  const [items, setItems] = useState<Inventory.InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Cable', supplier: '' });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      // Load from backend or local storage
      await new Promise(resolve => setTimeout(resolve, 500));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      loadItems();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredItems = Inventory.searchInventory(items, searchQuery);

  const handleAddItem = () => {
    if (!formData.name.trim() || !formData.supplier.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const newItem = Inventory.createInventoryItem(
      formData.name,
      formData.type,
      '',
      50,
      0,
      formData.supplier
    );
    setItems([...items, newItem]);
    setFormData({ name: '', type: 'Cable', supplier: '' });
    setShowForm(false);
    Alert.alert('Success', `${formData.name} added to inventory`);
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      { text: 'Delete', onPress: () => setItems(items.filter(i => i.id !== itemId)), style: 'destructive' },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.emptyText, { marginTop: 12 }]}>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.statsContainer}>
          <StatBox label="Total Items" value={String(items.length)} />
          <StatBox label="Low Stock" value={String(items.filter(i => i.currentStock < i.minimumStock).length)} color={items.some(i => i.currentStock < i.minimumStock) ? colors.destructive : colors.chart.green} />
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search inventory..."
          placeholderTextColor={colors.mutedForeground}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>

        {showForm && (
          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Item name" value={formData.name} onChangeText={e => setFormData({ ...formData, name: e })} />
            <TextInput style={styles.input} placeholder="Supplier" value={formData.supplier} onChangeText={e => setFormData({ ...formData, supplier: e })} />
            <TouchableOpacity style={styles.submitButton} onPress={handleAddItem}>
              <Text style={styles.submitButtonText}>Save Item</Text>
            </TouchableOpacity>
          </View>
        )}

        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items in inventory</Text>
          </View>
        ) : (
          filteredItems.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemType}>{item.type}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteItem(item.id || '')}>
                  <Text style={styles.deleteButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.itemDetails}>
                <DetailRow label="Stock" value={`${item.currentStock}`} />
                <DetailRow label="Min" value={`${item.minimumStock}`} />
                <DetailRow label="Max" value={`${item.maximumStock}`} />
                <DetailRow label="Unit" value={item.unit} />
                <DetailRow label="Supplier" value={item.supplier} />
                <DetailRow label="Location" value={item.location} />
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function StatBox({ label, value, color = colors.primary }: { label: string; value: string; color?: string }) {
  return (
    <View style={[styles.statBox, { borderLeftColor: color }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  statsContainer: { flexDirection: 'row', padding: 12, gap: 12, flexWrap: 'wrap' },
  statBox: { flex: 1, minWidth: 140, padding: 12, backgroundColor: colors.card, borderRadius: 8, borderLeftWidth: 3 },
  statLabel: { fontSize: 12, color: colors.mutedForeground, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  searchInput: { marginHorizontal: 12, marginVertical: 8, padding: 12, backgroundColor: colors.card, borderRadius: 8, color: colors.foreground, borderWidth: 1, borderColor: colors.border },
  addButton: { marginHorizontal: 12, marginVertical: 8, padding: 12, backgroundColor: colors.primary, borderRadius: 8 },
  addButtonText: { color: colors.background, fontWeight: '600', textAlign: 'center' },
  form: { marginHorizontal: 12, marginVertical: 8, padding: 12, backgroundColor: colors.card, borderRadius: 8, gap: 8 },
  input: { padding: 10, backgroundColor: colors.background, borderRadius: 6, color: colors.foreground, borderWidth: 1, borderColor: colors.border },
  submitButton: { padding: 10, backgroundColor: colors.primary, borderRadius: 6 },
  submitButtonText: { color: colors.background, fontWeight: '600', textAlign: 'center' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: colors.mutedForeground, textAlign: 'center' },
  itemCard: { marginHorizontal: 12, marginVertical: 6, padding: 12, backgroundColor: colors.card, borderRadius: 8 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  itemType: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  deleteButton: { fontSize: 16, color: colors.destructive, fontWeight: 'bold' },
  itemDetails: { gap: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 12, color: colors.mutedForeground },
  detailValue: { fontSize: 12, color: colors.foreground, fontWeight: '500' },
});
