import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl, StyleSheet, TextInput, Modal, FlatList } from 'react-native';
import { colors } from '../theme/colors';
import * as JobManagement from '@/lib/jobManagement';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JOBS_STORAGE_KEY = 'fibertrace_jobs';
const ACTIVE_TIMER_KEY = 'fibertrace_active_timer';

export default function JobsHubScreen() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'active' | 'metrics'>('jobs');
  const [jobs, setJobs] = useState<JobManagement.Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobManagement.JobStatus | 'All'>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeJob, setActiveJob] = useState<JobManagement.Job | null>(null);
  const [timerState, setTimerState] = useState<JobManagement.JobTimerState | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    priority: 'Medium' as JobManagement.JobPriority,
    estimatedDuration: '2',
    estimatedCost: '100',
  });

  useEffect(() => {
    initializeData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const initializeData = async () => {
    const loadedJobs = await loadJobs();
    await loadActiveTimer(loadedJobs);
  };

  useEffect(() => {
    if (timerState?.isRunning) {
      timerRef.current = setInterval(() => {
        setTimerState(prev => prev ? { ...prev, elapsedSeconds: prev.elapsedSeconds + 1 } : null);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState?.isRunning]);

  const loadJobs = async (): Promise<JobManagement.Job[]> => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
      let loadedJobs: JobManagement.Job[];
      if (stored) {
        loadedJobs = JSON.parse(stored);
      } else {
        loadedJobs = createSampleJobs();
        await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(loadedJobs));
      }
      setJobs(loadedJobs);
      return loadedJobs;
    } catch (error) {
      Alert.alert('Error', 'Failed to load jobs');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createSampleJobs = (): JobManagement.Job[] => {
    return [
      JobManagement.createJob('Fiber Installation - Block A', 'Install new fiber cables in residential block A', 'tech@company.com', ['NODE-001'], ['ROUTE-001'], new Date().toISOString().split('T')[0], '09:00', 14400, 'High', [], 500),
      JobManagement.createJob('Network Maintenance', 'Routine maintenance on distribution network', 'tech@company.com', ['NODE-002'], ['ROUTE-002'], new Date().toISOString().split('T')[0], '14:00', 7200, 'Medium', [], 200),
      JobManagement.createJob('Emergency Repair', 'Fix broken cable at junction box', 'tech@company.com', ['NODE-003'], [], new Date().toISOString().split('T')[0], '10:30', 3600, 'Critical', [], 150),
    ];
  };

  const loadActiveTimer = async (loadedJobs: JobManagement.Job[]) => {
    try {
      const stored = await AsyncStorage.getItem(ACTIVE_TIMER_KEY);
      if (stored) {
        const timer = JSON.parse(stored) as JobManagement.JobTimerState;
        setTimerState(timer);
        const job = loadedJobs.find(j => j.id === timer.jobId);
        if (job) {
          setActiveJob(job);
          if (timer.isRunning) {
            setActiveTab('active');
          }
        }
      }
    } catch (error) {
      console.error('Failed to load timer', error);
    }
  };

  const saveJobs = async (updatedJobs: JobManagement.Job[]) => {
    await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedJobs));
    setJobs(updatedJobs);
  };

  const saveTimer = async (timer: JobManagement.JobTimerState | null) => {
    if (timer) {
      await AsyncStorage.setItem(ACTIVE_TIMER_KEY, JSON.stringify(timer));
    } else {
      await AsyncStorage.removeItem(ACTIVE_TIMER_KEY);
    }
    setTimerState(timer);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  const handleCreateJob = async () => {
    if (!createForm.name.trim()) {
      Alert.alert('Error', 'Job name is required');
      return;
    }
    try {
      const newJob = JobManagement.createJob(
        createForm.name,
        createForm.description,
        'tech@company.com',
        [],
        [],
        new Date().toISOString().split('T')[0],
        '09:00',
        parseFloat(createForm.estimatedDuration) * 3600,
        createForm.priority,
        [],
        parseFloat(createForm.estimatedCost)
      );
      const updated = [...jobs, newJob];
      await saveJobs(updated);
      setCreateForm({ name: '', description: '', priority: 'Medium', estimatedDuration: '2', estimatedCost: '100' });
      setShowCreateModal(false);
      Alert.alert('Success', `Job ${newJob.jobId} created`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create job');
    }
  };

  const handleStartJob = async (job: JobManagement.Job) => {
    if (timerState?.isRunning) {
      Alert.alert('Error', 'Please complete or pause the current job first');
      return;
    }
    try {
      const updatedJob = { ...job, status: 'In Progress' as JobManagement.JobStatus, updatedAt: new Date().toISOString() };
      const currentJobs = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
      const jobsList = currentJobs ? JSON.parse(currentJobs) : [];
      const updated = jobsList.map((j: JobManagement.Job) => j.id === job.id ? updatedJob : j);
      await saveJobs(updated);
      const existingTime = timerState?.jobId === job.id ? timerState.elapsedSeconds : 0;
      const timer: JobManagement.JobTimerState = { jobId: job.id, isRunning: true, elapsedSeconds: existingTime };
      await saveTimer(timer);
      setActiveJob(updatedJob);
      setActiveTab('active');
    } catch (error) {
      Alert.alert('Error', 'Failed to start job');
    }
  };

  const handlePauseTimer = async () => {
    if (timerState) {
      await saveTimer({ ...timerState, isRunning: false, pausedAt: Date.now() });
    }
  };

  const handleResumeTimer = async () => {
    if (timerState) {
      await saveTimer({ ...timerState, isRunning: true, pausedAt: undefined });
    }
  };

  const handleCompleteJob = async () => {
    if (!activeJob || !timerState) return;
    Alert.alert('Complete Job', 'Are you sure you want to mark this job as completed?', [
      { text: 'Cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          try {
            const completedJob = JobManagement.completeJob(activeJob, {
              durationSeconds: timerState.elapsedSeconds,
              actualCost: activeJob.estimatedCost,
              notes: '',
              signedBy: 'tech@company.com',
            });
            const currentJobs = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
            const jobsList = currentJobs ? JSON.parse(currentJobs) : [];
            const updated = jobsList.map((j: JobManagement.Job) => j.id === activeJob.id ? completedJob : j);
            await saveJobs(updated);
            await saveTimer(null);
            setActiveJob(null);
            Alert.alert('Success', 'Job completed successfully');
            setActiveTab('jobs');
          } catch (error) {
            Alert.alert('Error', 'Failed to complete job');
          }
        },
      },
    ]);
  };

  const handleDeleteJob = (jobId: string) => {
    Alert.alert('Delete Job', 'Are you sure you want to delete this job?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = jobs.filter(j => j.id !== jobId);
          await saveJobs(updated);
        },
      },
    ]);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: JobManagement.JobStatus) => {
    switch (status) {
      case 'In Progress': return colors.chart.green;
      case 'Pending': return colors.chart.amber;
      case 'Completed': return colors.mutedForeground;
      case 'On Hold': return colors.destructive;
      default: return colors.mutedForeground;
    }
  };

  const getPriorityColor = (priority: JobManagement.JobPriority) => {
    switch (priority) {
      case 'Critical': return colors.destructive;
      case 'High': return colors.chart.amber;
      case 'Medium': return colors.primary;
      default: return colors.mutedForeground;
    }
  };

  const filteredJobs = (() => {
    let result = [...jobs];
    if (statusFilter !== 'All') {
      result = JobManagement.filterJobsByStatus(result, statusFilter);
    }
    if (searchQuery.trim()) {
      result = JobManagement.searchJobs(result, searchQuery);
    }
    return result;
  })();

  const stats = JobManagement.getJobStats(jobs);
  const completedJobs = jobs.filter(j => j.status === 'Completed');
  const metrics = JobManagement.getJobMetrics(completedJobs);

  const renderJobsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.inProgressJobs}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.pendingJobs}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.completedJobs}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs..."
          placeholderTextColor={colors.mutedForeground}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterTabs}>
        {(['All', 'Pending', 'In Progress', 'Completed'] as const).map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.filterTab, statusFilter === status && styles.filterTabActive]}
            onPress={() => setStatusFilter(status)}
          >
            <Text style={[styles.filterTabText, statusFilter === status && styles.filterTabTextActive]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
        <Text style={styles.createButtonText}>+ Create New Job</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item: job }) => (
          <TouchableOpacity style={[styles.jobCard, { borderLeftColor: getPriorityColor(job.priority) }]}>
            <View style={styles.jobHeader}>
              <View style={styles.jobTitleSection}>
                <Text style={styles.jobTitle}>{job.name}</Text>
                <Text style={styles.jobId}>{job.jobId}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                <Text style={styles.statusText}>{job.status}</Text>
              </View>
            </View>
            <Text style={styles.description}>{job.description}</Text>
            <View style={styles.jobMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Scheduled</Text>
                <Text style={styles.metaValue}>{new Date(job.scheduledDate).toLocaleDateString()}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Duration</Text>
                <Text style={styles.metaValue}>{(job.estimatedDuration / 3600).toFixed(1)}h</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Cost</Text>
                <Text style={styles.metaValue}>${job.estimatedCost.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.jobActions}>
              {job.status === 'Pending' && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.chart.green }]} onPress={() => handleStartJob(job)}>
                  <Text style={styles.actionButtonText}>Start</Text>
                </TouchableOpacity>
              )}
              {job.status === 'In Progress' && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={() => { setActiveJob(job); setActiveTab('active'); }}>
                  <Text style={styles.actionButtonText}>View Active</Text>
                </TouchableOpacity>
              )}
              {job.status !== 'In Progress' && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.destructive }]} onPress={() => handleDeleteJob(job.id)}>
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{loading ? 'Loading jobs...' : 'No jobs found'}</Text>
          </View>
        }
      />
    </View>
  );

  const renderActiveTab = () => (
    <View style={styles.tabContent}>
      {activeJob ? (
        <View style={styles.activeJobContainer}>
          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>Active Job Timer</Text>
            <Text style={styles.timerDisplay}>{formatTime(timerState?.elapsedSeconds || 0)}</Text>
            <View style={styles.timerControls}>
              {timerState?.isRunning ? (
                <TouchableOpacity style={[styles.timerButton, { backgroundColor: colors.chart.amber }]} onPress={handlePauseTimer}>
                  <Text style={styles.timerButtonText}>Pause</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.timerButton, { backgroundColor: colors.chart.green }]} onPress={handleResumeTimer}>
                  <Text style={styles.timerButtonText}>Resume</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.timerButton, { backgroundColor: colors.primary }]} onPress={handleCompleteJob}>
                <Text style={styles.timerButtonText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.activeJobDetails}>
            <Text style={styles.activeJobTitle}>{activeJob.name}</Text>
            <Text style={styles.activeJobId}>{activeJob.jobId}</Text>
            <Text style={styles.activeJobDescription}>{activeJob.description}</Text>
            <View style={styles.progressInfo}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Estimated Duration:</Text>
                <Text style={styles.progressValue}>{(activeJob.estimatedDuration / 3600).toFixed(1)}h</Text>
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Time Elapsed:</Text>
                <Text style={styles.progressValue}>{((timerState?.elapsedSeconds || 0) / 3600).toFixed(2)}h</Text>
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Progress:</Text>
                <Text style={styles.progressValue}>{Math.min(100, Math.round(((timerState?.elapsedSeconds || 0) / activeJob.estimatedDuration) * 100))}%</Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noActiveJob}>
          <Text style={styles.noActiveJobTitle}>No Active Job</Text>
          <Text style={styles.noActiveJobText}>Start a job from the Jobs tab to track your progress</Text>
          <TouchableOpacity style={styles.goToJobsButton} onPress={() => setActiveTab('jobs')}>
            <Text style={styles.goToJobsButtonText}>Go to Jobs</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderMetricsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Job Performance Metrics</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.totalJobsCompleted}</Text>
          <Text style={styles.metricLabel}>Jobs Completed</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{(metrics.averageCompletionTime / 3600).toFixed(1)}h</Text>
          <Text style={styles.metricLabel}>Avg Completion Time</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.onTimePercentage.toFixed(0)}%</Text>
          <Text style={styles.metricLabel}>On-Time Rate</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, metrics.costOverrunPercentage > 20 && { color: colors.destructive }]}>
            {metrics.costOverrunPercentage.toFixed(0)}%
          </Text>
          <Text style={styles.metricLabel}>Cost Overrun Rate</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Overall Statistics</Text>
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Total Jobs</Text>
          <Text style={styles.statsValue}>{stats.totalJobs}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Total Duration (Hours)</Text>
          <Text style={styles.statsValue}>{stats.totalDurationHours.toFixed(1)}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Total Cost</Text>
          <Text style={styles.statsValue}>${stats.totalCost.toFixed(2)}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Unsynced Changes</Text>
          <Text style={[styles.statsValue, stats.unsyncedCount > 0 && { color: colors.destructive }]}>
            {stats.unsyncedCount}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Completed Jobs</Text>
      {completedJobs.slice(0, 5).map(job => {
        const report = JobManagement.generateCompletionReport(job);
        return (
          <View key={job.id} style={styles.completedJobCard}>
            <Text style={styles.completedJobName}>{report.name}</Text>
            <Text style={styles.completedJobId}>{report.jobId}</Text>
            <View style={styles.completedJobDetails}>
              <Text style={styles.completedJobDetail}>Duration: {report.duration}</Text>
              <Text style={styles.completedJobDetail}>Cost Variance: {report.costVariance}</Text>
            </View>
          </View>
        );
      })}
      {completedJobs.length === 0 && (
        <Text style={styles.noDataText}>No completed jobs yet</Text>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, activeTab === 'jobs' && styles.tabActive]} onPress={() => setActiveTab('jobs')}>
          <Text style={[styles.tabText, activeTab === 'jobs' && styles.tabTextActive]}>Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'active' && styles.tabActive]} onPress={() => setActiveTab('active')}>
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>Active</Text>
          {timerState?.isRunning && <View style={styles.activeDot} />}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'metrics' && styles.tabActive]} onPress={() => setActiveTab('metrics')}>
          <Text style={[styles.tabText, activeTab === 'metrics' && styles.tabTextActive]}>Metrics</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'jobs' && renderJobsTab()}
      {activeTab === 'active' && renderActiveTab()}
      {activeTab === 'metrics' && renderMetricsTab()}

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Job</Text>
            <TextInput
              style={styles.input}
              placeholder="Job Name"
              placeholderTextColor={colors.mutedForeground}
              value={createForm.name}
              onChangeText={(t) => setCreateForm(p => ({ ...p, name: t }))}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Description"
              placeholderTextColor={colors.mutedForeground}
              value={createForm.description}
              onChangeText={(t) => setCreateForm(p => ({ ...p, description: t }))}
              multiline
            />
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Priority</Text>
                <View style={styles.priorityOptions}>
                  {(['Low', 'Medium', 'High', 'Critical'] as const).map(p => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.priorityOption, createForm.priority === p && styles.priorityOptionActive]}
                      onPress={() => setCreateForm(prev => ({ ...prev, priority: p }))}
                    >
                      <Text style={[styles.priorityOptionText, createForm.priority === p && styles.priorityOptionTextActive]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Est. Duration (hours)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2"
                  placeholderTextColor={colors.mutedForeground}
                  value={createForm.estimatedDuration}
                  onChangeText={(t) => setCreateForm(p => ({ ...p, estimatedDuration: t }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Est. Cost ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="100"
                  placeholderTextColor={colors.mutedForeground}
                  value={createForm.estimatedCost}
                  onChangeText={(t) => setCreateForm(p => ({ ...p, estimatedCost: t }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCreateModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleCreateJob}>
                <Text style={styles.submitButtonText}>Create Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabBar: { flexDirection: 'row', backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', position: 'relative' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 14, color: colors.mutedForeground, fontWeight: '500' },
  tabTextActive: { color: colors.primary },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.chart.green, position: 'absolute', top: 8, right: '30%' },
  tabContent: { flex: 1 },
  statsBar: { flexDirection: 'row', padding: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  searchContainer: { padding: 12 },
  searchInput: { backgroundColor: colors.card, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: colors.foreground, borderWidth: 1, borderColor: colors.border },
  filterTabs: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 8 },
  filterTab: { paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderRadius: 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { fontSize: 12, color: colors.mutedForeground, fontWeight: '500' },
  filterTabTextActive: { color: colors.background },
  createButton: { marginHorizontal: 12, marginBottom: 12, padding: 12, backgroundColor: colors.primary, borderRadius: 8, alignItems: 'center' },
  createButtonText: { color: colors.background, fontWeight: '600' },
  jobCard: { backgroundColor: colors.card, borderRadius: 8, padding: 12, marginHorizontal: 12, marginBottom: 10, borderLeftWidth: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  jobTitleSection: { flex: 1 },
  jobTitle: { fontSize: 16, fontWeight: '600', color: colors.foreground },
  jobId: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '600', color: colors.background },
  description: { fontSize: 13, color: colors.mutedForeground, marginBottom: 8 },
  jobMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metaItem: { alignItems: 'center' },
  metaLabel: { fontSize: 10, color: colors.mutedForeground },
  metaValue: { fontSize: 13, fontWeight: '600', color: colors.primary, marginTop: 2 },
  jobActions: { flexDirection: 'row', gap: 8 },
  actionButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  actionButtonText: { color: colors.background, fontSize: 12, fontWeight: '600' },
  emptyState: { justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: 16, color: colors.mutedForeground },
  activeJobContainer: { flex: 1, padding: 16 },
  timerCard: { backgroundColor: colors.card, borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 16 },
  timerLabel: { fontSize: 14, color: colors.mutedForeground, marginBottom: 8 },
  timerDisplay: { fontSize: 48, fontWeight: 'bold', color: colors.primary, fontVariant: ['tabular-nums'] },
  timerControls: { flexDirection: 'row', gap: 12, marginTop: 16 },
  timerButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  timerButtonText: { color: colors.background, fontWeight: '600', fontSize: 16 },
  activeJobDetails: { backgroundColor: colors.card, borderRadius: 12, padding: 16 },
  activeJobTitle: { fontSize: 18, fontWeight: '600', color: colors.foreground },
  activeJobId: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  activeJobDescription: { fontSize: 14, color: colors.mutedForeground, marginTop: 8, marginBottom: 12 },
  progressInfo: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14, color: colors.mutedForeground },
  progressValue: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  noActiveJob: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  noActiveJobTitle: { fontSize: 20, fontWeight: '600', color: colors.foreground, marginBottom: 8 },
  noActiveJobText: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', marginBottom: 16 },
  goToJobsButton: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  goToJobsButtonText: { color: colors.background, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.foreground, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  metricCard: { width: '48%', backgroundColor: colors.card, borderRadius: 8, padding: 16, margin: '1%', alignItems: 'center' },
  metricValue: { fontSize: 24, fontWeight: 'bold', color: colors.primary },
  metricLabel: { fontSize: 12, color: colors.mutedForeground, marginTop: 4, textAlign: 'center' },
  statsCard: { backgroundColor: colors.card, borderRadius: 8, marginHorizontal: 16, padding: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  statsLabel: { fontSize: 14, color: colors.mutedForeground },
  statsValue: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  completedJobCard: { backgroundColor: colors.card, borderRadius: 8, marginHorizontal: 16, marginBottom: 8, padding: 12 },
  completedJobName: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  completedJobId: { fontSize: 12, color: colors.mutedForeground },
  completedJobDetails: { flexDirection: 'row', marginTop: 8, gap: 16 },
  completedJobDetail: { fontSize: 12, color: colors.mutedForeground },
  noDataText: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', padding: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: colors.card, borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: colors.foreground, marginBottom: 16 },
  input: { backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: colors.foreground, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  formRow: { flexDirection: 'row', gap: 12 },
  formField: { flex: 1, marginBottom: 12 },
  formLabel: { fontSize: 12, color: colors.mutedForeground, marginBottom: 6 },
  priorityOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  priorityOption: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  priorityOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  priorityOptionText: { fontSize: 12, color: colors.mutedForeground },
  priorityOptionTextActive: { color: colors.background },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  cancelButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.background },
  cancelButtonText: { color: colors.mutedForeground, fontWeight: '500' },
  submitButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.primary },
  submitButtonText: { color: colors.background, fontWeight: '600' },
});
