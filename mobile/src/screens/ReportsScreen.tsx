import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { colors } from '../theme/colors';
import * as Reports from '@/lib/reportGeneration';

const MOCK_JOBS = Array.from({ length: 12 }, (_, i) => ({
  id: `j${i}`,
  jobId: `JOB-${String(i + 1).padStart(3, '0')}`,
  name: `Job ${i + 1}`,
  status: ['Completed', 'In Progress'][Math.floor(Math.random() * 2)],
  actualCost: Math.floor(Math.random() * 2000) + 500,
  duration: Math.floor(Math.random() * 14400) + 3600,
  assignedTechnician: 'John Doe',
}));

export default function ReportsScreen() {
  const [selectedReport, setSelectedReport] = useState<Reports.ReportType>('JobCompletion');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const generateReport = async (type: Reports.ReportType) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      Alert.alert('Report Generated', `${type} report ready for export`);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        {/* Report Types */}
        <Text style={styles.sectionTitle}>Available Reports</Text>
        
        <ReportTypeCard
          title="Job Completion"
          description="Jobs completed, costs, durations"
          selected={selectedReport === 'JobCompletion'}
          onPress={() => { setSelectedReport('JobCompletion'); generateReport('JobCompletion'); }}
        />
        
        <ReportTypeCard
          title="Team Performance"
          description="Technician utilization and productivity"
          selected={selectedReport === 'TeamPerformance'}
          onPress={() => { setSelectedReport('TeamPerformance'); generateReport('TeamPerformance'); }}
        />
        
        <ReportTypeCard
          title="Inventory Status"
          description="Stock levels and material costs"
          selected={selectedReport === 'Inventory'}
          onPress={() => { setSelectedReport('Inventory'); generateReport('Inventory'); }}
        />

        {/* Export Formats */}
        <Text style={styles.sectionTitle}>Export Format</Text>
        <View style={styles.formatsContainer}>
          {['PDF', 'CSV', 'JSON', 'Excel'].map(format => (
            <TouchableOpacity key={format} style={styles.formatButton}>
              <Text style={styles.formatButtonText}>{format}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Generating report...</Text>
          </View>
        )}

        {/* Recent Reports */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <RecentReportItem date="Today" report="Job Completion (PDF)" size="2.4 MB" />
        <RecentReportItem date="Yesterday" report="Team Performance (CSV)" size="156 KB" />
        <RecentReportItem date="2 days ago" report="Inventory Status (JSON)" size="892 KB" />

        {/* Features */}
        <Text style={styles.sectionTitle}>Report Features</Text>
        <FeatureItem title="Multi-format Export" description="PDF, CSV, JSON, Excel support" />
        <FeatureItem title="Custom Filtering" description="Filter by date, technician, status" />
        <FeatureItem title="Real-time Data" description="Live job and inventory data included" />
        <FeatureItem title="Scheduled Reports" description="Coming soon - automated report generation" />
      </ScrollView>
    </View>
  );
}

function ReportTypeCard({ title, description, selected, onPress }: { title: string; description: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.reportCard, selected && styles.reportCardSelected]}
      onPress={onPress}
    >
      <Text style={styles.reportCardTitle}>{title}</Text>
      <Text style={styles.reportCardDescription}>{description}</Text>
    </TouchableOpacity>
  );
}

function RecentReportItem({ date, report, size }: { date: string; report: string; size: string }) {
  return (
    <View style={styles.recentItem}>
      <View>
        <Text style={styles.recentDate}>{date}</Text>
        <Text style={styles.recentReport}>{report}</Text>
      </View>
      <Text style={styles.recentSize}>{size}</Text>
    </View>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.foreground, paddingHorizontal: 12, paddingVertical: 12 },
  reportCard: { marginHorizontal: 12, marginBottom: 8, padding: 12, backgroundColor: colors.card, borderRadius: 6, borderWidth: 1, borderColor: colors.border },
  reportCardSelected: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primary + '15' },
  reportCardTitle: { fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 4 },
  reportCardDescription: { fontSize: 11, color: colors.mutedForeground },
  formatsContainer: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingBottom: 12 },
  formatButton: { flex: 1, paddingVertical: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 4, alignItems: 'center' },
  formatButtonText: { fontSize: 11, fontWeight: '600', color: colors.foreground },
  loadingContainer: { paddingVertical: 40, alignItems: 'center' },
  loadingText: { fontSize: 13, color: colors.mutedForeground, marginTop: 12 },
  recentItem: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  recentDate: { fontSize: 11, color: colors.mutedForeground, marginBottom: 2 },
  recentReport: { fontSize: 13, fontWeight: '600', color: colors.foreground },
  recentSize: { fontSize: 11, color: colors.chart.green, fontWeight: '600' },
  featureItem: { marginHorizontal: 12, marginBottom: 8, padding: 12, backgroundColor: colors.card, borderRadius: 6, borderWidth: 1, borderColor: colors.border },
  featureTitle: { fontSize: 12, fontWeight: '600', color: colors.foreground, marginBottom: 4 },
  featureDescription: { fontSize: 11, color: colors.mutedForeground },
});
