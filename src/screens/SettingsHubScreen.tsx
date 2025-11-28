import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { colors } from '../theme/colors';
import * as Notifications from '@/lib/pushNotifications';
import * as AuthStorage from '../lib/authStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TabType = 'settings' | 'profile' | 'notifications';

interface SettingsHubProps {
  onLogout?: () => void;
}

export default function SettingsHubScreen({ onLogout }: SettingsHubProps) {
  const [activeTab, setActiveTab] = useState<TabType>('settings');

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'settings', label: 'Settings', icon: '⚙️' },
    { key: 'profile', label: 'Profile', icon: '👤' },
    { key: 'notifications', label: 'Alerts', icon: '🔔' },
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
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'profile' && <ProfileTab onLogout={onLogout} />}
        {activeTab === 'notifications' && <NotificationsTab />}
      </View>
    </View>
  );
}

function SettingsTab() {
  const [darkMode, setDarkMode] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [gpsAlways, setGpsAlways] = useState(false);
  const [dataLimit, setDataLimit] = useState(false);

  const handleToggle = async (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    try {
      await AsyncStorage.setItem(`setting_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const cacheKeys = keys.filter(k => k.startsWith('cache_'));
              await AsyncStorage.multiRemove(cacheKeys);
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleFactoryReset = () => {
    Alert.alert(
      'Factory Reset',
      'This will clear ALL local data including saved settings, cached data, and user preferences. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Reset Complete', 'App has been reset to factory settings');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset app');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <SettingRow label="Dark Mode" value={darkMode} onToggle={v => handleToggle('darkMode', v, setDarkMode)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Sync</Text>
        <SettingRow label="Auto Sync" value={autoSync} onToggle={v => handleToggle('autoSync', v, setAutoSync)} />
        <SettingRow label="Always-On GPS" value={gpsAlways} onToggle={v => handleToggle('gpsAlways', v, setGpsAlways)} />
        <SettingRow label="Data Saver Mode" value={dataLimit} onToggle={v => handleToggle('dataLimit', v, setDataLimit)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <InfoRow label="App Version" value="1.0.0" />
        <InfoRow label="Build Number" value="2025.11.28" />
        <InfoRow label="Device ID" value="DEV-2025-001" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage</Text>
        <StorageRow label="Cache Size" value="24 MB" />
        <StorageRow label="Local Data" value="156 MB" />
        <StorageRow label="Available" value="2.3 GB" />
        <TouchableOpacity style={styles.actionButton} onPress={handleClearCache}>
          <Text style={styles.actionButtonText}>Clear Cache</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleFactoryReset}>
          <Text style={styles.dangerButtonText}>Factory Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>FiberTrace</Text>
          <Text style={styles.aboutVersion}>v1.0.0</Text>
          <Text style={styles.aboutDesc}>Professional fiber optic technician management system</Text>
          <Text style={styles.aboutCopy}>© 2025 FiberTrace. All rights reserved.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function ProfileTab({ onLogout }: { onLogout?: () => void }) {
  const [user, setUser] = useState({
    id: 'tech-001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Technician',
    phone: '+1 (555) 123-4567',
    department: 'Field Operations',
    location: 'New York City',
    jobsCompleted: 127,
    hoursLogged: 892,
    specializations: ['Splicing', 'Testing', 'Installation'],
    joinDate: 'January 2023',
  });

  React.useEffect(() => {
    const loadUser = async () => {
      const savedUser = await AuthStorage.getStoredUser();
      if (savedUser) {
        setUser(prev => ({
          ...prev,
          name: savedUser.full_name || prev.name,
          email: savedUser.email || prev.email,
          role: savedUser.role || prev.role,
        }));
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AuthStorage.clearUser();
            if (onLogout) {
              onLogout();
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.split(' ').map(n => n[0]).join('')}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userRole}>{user.role}</Text>
          <Text style={styles.userId}>ID: {user.id}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <StatBox label="Jobs Completed" value={user.jobsCompleted.toString()} color={colors.chart.cyan} />
        <StatBox label="Hours Logged" value={user.hoursLogged.toString()} color={colors.chart.green} />
        <StatBox label="Rating" value="4.9★" color={colors.chart.amber} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <InfoField label="Email" value={user.email} />
        <InfoField label="Phone" value={user.phone} />
        <InfoField label="Department" value={user.department} />
        <InfoField label="Location" value={user.location} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Info</Text>
        <InfoField label="Role" value={user.role} />
        <InfoField label="Joined" value={user.joinDate} />
        <InfoField label="Experience" value="3+ years" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specializations</Text>
        <View style={styles.tagsContainer}>
          {user.specializations.map((spec, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>{spec}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team</Text>
        <TeamMember name="Sarah Lee" role="Team Lead" status="Online" />
        <TeamMember name="Mike Johnson" role="Technician" status="Offline" />
        <TeamMember name="Jane Smith" role="Technician" status="Online" />
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.profileActionButton} onPress={() => Alert.alert('Edit Profile', 'Profile editing coming soon')}>
          <Text style={styles.profileActionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.profileActionButton, { backgroundColor: colors.chart.green + '20' }]} onPress={() => Alert.alert('Change Password', 'Password change coming soon')}>
          <Text style={[styles.profileActionButtonText, { color: colors.chart.green }]}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.profileActionButton, { backgroundColor: colors.destructive + '20' }]} onPress={handleLogout}>
          <Text style={[styles.profileActionButtonText, { color: colors.destructive }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notifications.PushNotificationPayload[]>([
    {
      id: 'n1',
      title: 'Job JOB-001 Started',
      body: 'Main Street Installation job has started. Current status: In Progress',
      category: 'job',
      priority: 'high',
      data: { jobId: 'JOB-001' },
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'n2',
      title: 'Low Stock Alert',
      body: 'SMF Cable running low: 120 units remaining (min: 100)',
      category: 'inventory',
      priority: 'normal',
      data: { itemId: 'inv1' },
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
  ]);
  const [prefs, setPrefs] = useState<Notifications.NotificationPreferences>(Notifications.getNotificationPreferences());

  const handleTogglePreference = async (key: keyof Notifications.NotificationPreferences) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    Notifications.setNotificationPreferences(newPrefs);
    try {
      await AsyncStorage.setItem('notification_prefs', JSON.stringify(newPrefs));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  };

  const handleSendTestNotification = (category: 'job' | 'inventory' | 'system') => {
    let notification: Notifications.PushNotificationPayload;
    if (category === 'job') {
      notification = Notifications.createJobAlert('JOB-TEST', 'Test Job', 'This is a test notification');
    } else if (category === 'inventory') {
      notification = Notifications.createInventoryAlert('Test Item', 25);
    } else {
      notification = Notifications.createSystemAlert('System maintenance in 1 hour');
    }
    setNotifications([notification, ...notifications]);
    Alert.alert('Success', 'Test notification sent!');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'job': return colors.chart.cyan;
      case 'inventory': return colors.chart.amber;
      case 'system': return colors.destructive;
      default: return colors.primary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.destructive;
      case 'normal': return colors.chart.green;
      case 'low': return colors.mutedForeground;
      default: return colors.primary;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(diff / 86400000);
    return days === 1 ? '1 day ago' : `${days}d ago`;
  };

  return (
    <ScrollView>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        <PrefRow label="Job Alerts" value={prefs.jobAlerts} onToggle={() => handleTogglePreference('jobAlerts')} />
        <PrefRow label="Inventory Alerts" value={prefs.inventoryAlerts} onToggle={() => handleTogglePreference('inventoryAlerts')} />
        <PrefRow label="System Alerts" value={prefs.systemAlerts} onToggle={() => handleTogglePreference('systemAlerts')} />
        <PrefRow label="Sound Enabled" value={prefs.soundEnabled} onToggle={() => handleTogglePreference('soundEnabled')} />
        <PrefRow label="Vibration Enabled" value={prefs.vibrationEnabled} onToggle={() => handleTogglePreference('vibrationEnabled')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Send Test Notification</Text>
        <TouchableOpacity style={styles.testButton} onPress={() => handleSendTestNotification('job')}>
          <Text style={styles.testButtonText}>Test Job Alert</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.testButton, { backgroundColor: colors.chart.amber + '30' }]} onPress={() => handleSendTestNotification('inventory')}>
          <Text style={styles.testButtonText}>Test Inventory Alert</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.testButton, { backgroundColor: colors.destructive + '30' }]} onPress={() => handleSendTestNotification('system')}>
          <Text style={styles.testButtonText}>Test System Alert</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Notifications ({notifications.length})</Text>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}><Text style={styles.emptyText}>No notifications</Text></View>
        ) : (
          notifications.map(notif => (
            <View key={notif.id} style={styles.notificationCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={[styles.badge, { backgroundColor: getCategoryColor(notif.category) + '30', color: getCategoryColor(notif.category) }]}>
                  {notif.category}
                </Text>
              </View>
              <Text style={styles.notifBody}>{notif.body}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={styles.timestamp}>{formatTime(notif.timestamp)}</Text>
                <Text style={[styles.priority, { color: getPriorityColor(notif.priority) }]}>
                  {notif.priority.toUpperCase()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function SettingRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: (v: boolean) => void }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: colors.border, true: colors.primary }} />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function StorageRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.storageRow}>
      <Text style={styles.storageLabel}>{label}</Text>
      <Text style={styles.storageValue}>{value}</Text>
    </View>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.statBox, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoField}>
      <Text style={styles.infoFieldLabel}>{label}</Text>
      <Text style={styles.infoFieldValue}>{value}</Text>
    </View>
  );
}

function TeamMember({ name, role, status }: { name: string; role: string; status: string }) {
  const isOnline = status === 'Online';
  return (
    <View style={styles.teamMember}>
      <View style={styles.memberInfo}>
        <View style={[styles.memberAvatar, { backgroundColor: isOnline ? colors.chart.green : colors.border }]}>
          <Text style={styles.memberAvatarText}>{name[0]}</Text>
        </View>
        <View>
          <Text style={styles.memberName}>{name}</Text>
          <Text style={styles.memberRole}>{role}</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: isOnline ? colors.chart.green + '20' : colors.border }]}>
        <Text style={[styles.statusText, { color: isOnline ? colors.chart.green : colors.mutedForeground }]}>{status}</Text>
      </View>
    </View>
  );
}

function PrefRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={styles.prefRow}>
      <Text style={styles.prefLabel}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: colors.border, true: colors.primary }} />
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
  section: { paddingHorizontal: 12, paddingVertical: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: colors.primary, marginBottom: 12, textTransform: 'uppercase' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  settingLabel: { fontSize: 12, color: colors.foreground },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 10, color: colors.mutedForeground },
  infoValue: { fontSize: 10, fontWeight: '600', color: colors.foreground },
  storageRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  storageLabel: { fontSize: 10, color: colors.mutedForeground },
  storageValue: { fontSize: 10, fontWeight: '600', color: colors.chart.cyan },
  actionButton: { marginTop: 12, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: 6, alignItems: 'center' },
  actionButtonText: { fontSize: 11, fontWeight: '600', color: colors.background },
  dangerButton: { paddingVertical: 12, backgroundColor: colors.destructive + '20', borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: colors.destructive },
  dangerButtonText: { fontSize: 11, fontWeight: '600', color: colors.destructive },
  aboutCard: { backgroundColor: colors.card, borderRadius: 8, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  aboutTitle: { fontSize: 16, fontWeight: '600', color: colors.primary, marginBottom: 4 },
  aboutVersion: { fontSize: 11, color: colors.mutedForeground, marginBottom: 8 },
  aboutDesc: { fontSize: 10, color: colors.foreground, textAlign: 'center', marginBottom: 8 },
  aboutCopy: { fontSize: 8, color: colors.mutedForeground },
  profileHeader: { flexDirection: 'row', padding: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '600', color: colors.background },
  userName: { fontSize: 13, fontWeight: '600', color: colors.foreground },
  userRole: { fontSize: 11, color: colors.chart.cyan, marginTop: 2 },
  userId: { fontSize: 9, color: colors.mutedForeground, marginTop: 2 },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 16, gap: 8 },
  statBox: { flex: 1, backgroundColor: colors.card, borderRadius: 6, padding: 12, borderLeftWidth: 3 },
  statValue: { fontSize: 13, fontWeight: '600', color: colors.foreground },
  statLabel: { fontSize: 9, color: colors.mutedForeground, marginTop: 4 },
  infoField: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoFieldLabel: { fontSize: 10, color: colors.mutedForeground, marginBottom: 4 },
  infoFieldValue: { fontSize: 11, fontWeight: '600', color: colors.foreground },
  tagsContainer: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: { backgroundColor: colors.primary + '20', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: colors.primary },
  tagText: { fontSize: 9, fontWeight: '600', color: colors.primary },
  teamMember: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  memberInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  memberAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  memberAvatarText: { fontSize: 11, fontWeight: '600', color: colors.background },
  memberName: { fontSize: 10, fontWeight: '600', color: colors.foreground },
  memberRole: { fontSize: 8, color: colors.mutedForeground },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 8, fontWeight: '600' },
  profileActionButton: { marginVertical: 6, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 6, alignItems: 'center' },
  profileActionButtonText: { fontSize: 11, fontWeight: '600', color: colors.background },
  prefRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  prefLabel: { fontSize: 11, color: colors.foreground },
  testButton: { backgroundColor: colors.chart.cyan + '20', borderRadius: 6, paddingVertical: 12, alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: colors.primary },
  testButtonText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  notificationCard: { backgroundColor: colors.card, borderRadius: 6, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: colors.primary },
  notifTitle: { fontSize: 11, fontWeight: '600', color: colors.foreground, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 9, fontWeight: '600', overflow: 'hidden' },
  notifBody: { fontSize: 10, color: colors.mutedForeground, marginVertical: 4 },
  timestamp: { fontSize: 9, color: colors.mutedForeground },
  priority: { fontSize: 9, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { fontSize: 11, color: colors.mutedForeground },
});
