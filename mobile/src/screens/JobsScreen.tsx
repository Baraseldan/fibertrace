import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { colors } from '../theme/colors';

export function JobsScreen() {
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['/api/jobs'],
    queryFn: () => api.getJobs(),
  });

  const statusColors: Record<string, string> = {
    Pending: '#f59e0b',
    'In Progress': '#3b82f6',
    Completed: '#10b981',
  };

  const JobCard = ({ job }: { job: any }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobType}>{job.type}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[job.status] || colors.muted },
          ]}
        >
          <Text style={styles.statusText}>{job.status}</Text>
        </View>
      </View>
      <Text style={styles.jobAddress}>{job.address}</Text>
      <Text style={styles.jobDate}>
        Scheduled: {new Date(job.scheduledDate).toLocaleDateString()}
      </Text>
      {job.notes && <Text style={styles.jobNotes}>{job.notes}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No jobs yet</Text>
          <Text style={styles.emptySubtext}>Create a job from the map</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => <JobCard job={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: colors.mutedForeground,
    fontSize: 16,
  },
  emptyText: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  jobCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobType: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  jobAddress: {
    color: colors.foreground,
    fontSize: 14,
    marginBottom: 4,
  },
  jobDate: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginBottom: 8,
  },
  jobNotes: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
