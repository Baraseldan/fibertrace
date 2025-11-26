import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { colors } from '../theme/colors';
import * as Search from '@/lib/advancedSearch';

const MOCK_JOBS = [
  { id: 'j1', jobId: 'JOB-001', name: 'Main Street Installation', description: 'Fiber installation', status: 'In Progress', priority: 'High' },
  { id: 'j2', jobId: 'JOB-002', name: 'Downtown Splicing', description: 'Fiber splicing work', status: 'Completed', priority: 'Medium' },
  { id: 'j3', jobId: 'JOB-003', name: 'Park Avenue Route', description: 'Route installation', status: 'Pending', priority: 'Low' },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Search.SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const searchQuery: Search.SearchQuery = {
        text: query,
        filters: [],
        scope: 'all',
        sortBy: 'relevance',
        limit: 20,
      };
      const searchResults = Search.executeSearch(MOCK_JOBS, searchQuery);
      setResults(searchResults);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      handleSearch();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs, nodes, routes..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Filters Hint */}
        <View style={styles.filterHint}>
          <Text style={styles.filterHintText}>Advanced filters coming soon • Search by job ID, name, or description</Text>
        </View>

        {/* Results */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : results.length === 0 ? (
          query && (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateTitle}>No results found</Text>
              <Text style={styles.emptyStateText}>Try a different search term</Text>
            </View>
          )
        ) : (
          <View style={styles.resultsList}>
            {results.map(result => (
              <TouchableOpacity key={result.id} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>{result.title}</Text>
                  <Text style={styles.relevanceScore}>{Math.round(result.relevance / 10)}%</Text>
                </View>
                <Text style={styles.resultDescription}>{result.description || 'No description'}</Text>
                <View style={styles.resultFooter}>
                  <Text style={styles.resultType}>{result.type}</Text>
                  <Text style={styles.resultStatus}>{result.metadata.status}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchContainer: { flexDirection: 'row', padding: 12, gap: 8 },
  searchInput: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, color: colors.foreground },
  searchButton: { backgroundColor: colors.primary, paddingHorizontal: 16, borderRadius: 6, justifyContent: 'center' },
  searchButtonText: { fontSize: 12, fontWeight: '600', color: colors.background },
  filterHint: { paddingHorizontal: 12, paddingBottom: 12 },
  filterHintText: { fontSize: 11, color: colors.mutedForeground, textAlign: 'center' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 14, color: colors.mutedForeground, marginTop: 12 },
  emptyStateContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateTitle: { fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 8 },
  emptyStateText: { fontSize: 13, color: colors.mutedForeground },
  resultsList: { paddingHorizontal: 12, paddingBottom: 20 },
  resultCard: { backgroundColor: colors.card, borderRadius: 6, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  resultTitle: { fontSize: 14, fontWeight: '600', color: colors.foreground, flex: 1 },
  relevanceScore: { fontSize: 12, fontWeight: '600', color: colors.primary, minWidth: 40, textAlign: 'right' },
  resultDescription: { fontSize: 12, color: colors.mutedForeground, marginBottom: 8 },
  resultFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  resultType: { fontSize: 11, color: colors.chart.green, fontWeight: '600' },
  resultStatus: { fontSize: 11, color: colors.chart.amber, fontWeight: '600' },
});
