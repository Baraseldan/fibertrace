import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, Platform, TextInput } from 'react-native';
import { colors } from '../theme/colors';
import * as Notifications from '@/lib/pushNotifications';
import * as AuthStorage from '../lib/authStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';
import * as Permissions from '../lib/permissions';

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

interface AppConfig {
  autoSync: boolean;
  syncFrequency: number;
  dataLimit: boolean;
  bluetoothEnabled: boolean;
  gpsAlways: boolean;
  unitSystem: 'metric' | 'imperial';
  mapProvider: 'google' | 'openstreet';
  language: 'en' | 'es' | 'fr';
}

function SettingsTab() {
  const [config, setConfig] = useState<AppConfig>({
    autoSync: true,
    syncFrequency: 30,
    dataLimit: false,
    bluetoothEnabled: false,
    gpsAlways: false,
    unitSystem: 'metric',
    mapProvider: 'google',
    language: 'en',
  });
  const [apiEndpoint, setApiEndpoint] = useState('https://api.fibertrace.app');
  const [editingEndpoint, setEditingEndpoint] = useState(false);
  const [tempEndpoint, setTempEndpoint] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [storedConfig, storedEndpoint] = await AsyncStorage.multiGet([
        'app_config',
        'api_endpoint',
      ]);
      
      if (storedConfig[1]) {
        setConfig(JSON.parse(storedConfig[1]));
      }
      if (storedEndpoint[1]) {
        setApiEndpoint(storedEndpoint[1]);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleToggle = async (key: keyof AppConfig, value: boolean): Promise<void> => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    try {
      await AsyncStorage.setItem('app_config', JSON.stringify(newConfig));
      const user = await AuthStorage.getStoredUser();
      if (user?.id) {
        await api.updateUserSettings(user.id, { [key]: value }).catch((e: any) => console.warn('Backend sync failed:', e));
      }
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handleConfigChange = async (key: keyof AppConfig, value: any): Promise<void> => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    try {
      await AsyncStorage.setItem('app_config', JSON.stringify(newConfig));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const handleSaveEndpoint = async (): Promise<void> => {
    if (!tempEndpoint.trim()) {
      Alert.alert('Invalid', 'API endpoint cannot be empty');
      return;
    }
    try {
      await AsyncStorage.setItem('api_endpoint', tempEndpoint);
      setApiEndpoint(tempEndpoint);
      setEditingEndpoint(false);
      Alert.alert('✓ Saved', 'API endpoint updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API endpoint');
    }
  };

  const handleBluetoothToggle = async (value: boolean): Promise<void> => {
    if (value) {
      const granted = await Permissions.requestBluetoothPermission();
      if (!granted) {
        Alert.alert('Permission Denied', 'Bluetooth permission is required');
        return;
      }
      await Permissions.savePermissionPreference('bluetooth', true);
    }
    await handleToggle('bluetoothEnabled', value);
  };

  const handleGpsAlwaysToggle = async (value: boolean): Promise<void> => {
    if (value) {
      const granted = await Permissions.requestLocationPermission();
      if (!granted) {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }
      await Permissions.savePermissionPreference('location', true);
    }
    await handleToggle('gpsAlways', value);
  };

  const handleClearCache = async (): Promise<void> => {
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
              const cacheKeys = keys.filter((k: string) => k.startsWith('cache_'));
              await AsyncStorage.multiRemove(cacheKeys);
              Alert.alert('✓ Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleFactoryReset = (): void => {
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
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Sync</Text>
        <SettingRow label="Auto Sync" value={config.autoSync} onToggle={(v: boolean) => handleToggle('autoSync', v)} />
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sync Frequency (minutes)</Text>
          <View style={styles.frequencyOptions}>
            {[5, 15, 30, 60].map((freq: number) => (
              <TouchableOpacity
                key={freq}
                onPress={() => handleConfigChange('syncFrequency', freq)}
                style={[styles.freqButton, config.syncFrequency === freq && styles.freqButtonActive]}
              >
                <Text style={[styles.freqText, config.syncFrequency === freq && styles.freqTextActive]}>{freq}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <SettingRow label="Data Saver Mode" value={config.dataLimit} onToggle={(v: boolean) => handleToggle('dataLimit', v)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location & Hardware</Text>
        <SettingRow 
          label="Always-On GPS" 
          value={config.gpsAlways} 
          onToggle={handleGpsAlwaysToggle}
          subtitle="Continuous location tracking"
        />
        <SettingRow 
          label="Bluetooth Devices" 
          value={config.bluetoothEnabled} 
          onToggle={handleBluetoothToggle}
          subtitle="OTDR & power meter connection"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Utility Preferences</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Units</Text>
          <View style={styles.frequencyOptions}>
            {(['metric', 'imperial'] as const).map((unit: 'metric' | 'imperial') => (
              <TouchableOpacity
                key={unit}
                onPress={() => handleConfigChange('unitSystem', unit)}
                style={[styles.freqButton, config.unitSystem === unit && styles.freqButtonActive]}
              >
                <Text style={[styles.freqText, config.unitSystem === unit && styles.freqTextActive]}>
                  {unit === 'metric' ? 'KM' : 'MI'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Language</Text>
          <View style={styles.frequencyOptions}>
            {(['en', 'es', 'fr'] as const).map((lang: 'en' | 'es' | 'fr') => (
              <TouchableOpacity
                key={lang}
                onPress={() => handleConfigChange('language', lang)}
                style={[styles.freqButton, config.language === lang && styles.freqButtonActive]}
              >
                <Text style={[styles.freqText, config.language === lang && styles.freqTextActive]}>
                  {lang.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Configuration</Text>
        {editingEndpoint ? (
          <View>
            <TextInput
              value={tempEndpoint}
              onChangeText={setTempEndpoint}
              placeholder="https://api.example.com"
              style={styles.editInput}
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity style={[styles.actionButton, { flex: 1 }]} onPress={handleSaveEndpoint}>
                <Text style={styles.actionButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { flex: 1, backgroundColor: colors.card }]} onPress={() => setEditingEndpoint(false)}>
                <Text style={[styles.actionButtonText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <InfoRow label="API Endpoint" value={apiEndpoint} />
            <TouchableOpacity 
              style={[styles.actionButton, { marginTop: 8 }]} 
              onPress={() => {
                setTempEndpoint(apiEndpoint);
                setEditingEndpoint(true);
              }}
            >
              <Text style={styles.actionButtonText}>✏️ Edit Endpoint</Text>
            </TouchableOpacity>
          </>
        )}
        <InfoRow label="App Version" value="1.0.0" />
        <InfoRow label="Build" value="2025.11.29" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage</Text>
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
          <Text style={styles.aboutTitle}>FiberTrace Professional</Text>
          <Text style={styles.aboutVersion}>v1.0.0</Text>
          <Text style={styles.aboutDesc}>Enterprise fiber optic network management</Text>
          <Text style={styles.aboutCopy}>© 2025 FiberTrace. All rights reserved.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function ProfileTab({ onLogout }: { onLogout?: () => void }) {
  const [user, setUser] = useState({
    id: 'unknown',
    name: 'Technician',
    email: 'user@fibertrace.app',
    phone: '',
    role: 'Technician',
  });
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const savedUser = await AuthStorage.getStoredUser();
    if (savedUser) {
      const userData = {
        id: savedUser.id?.toString() || 'unknown',
        name: savedUser.full_name || 'Technician',
        email: savedUser.email,
        phone: savedUser.phone || '',
        role: savedUser.role || 'Technician',
      };
      setUser(userData);
      setEditName(userData.name);
      setEditPhone(userData.phone);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const savedUser = await AuthStorage.getStoredUser();
      if (savedUser?.id) {
        await api.updateUserProfile(savedUser.id, {
          full_name: editName,
          phone: editPhone,
        });
        setUser({ ...user, name: editName, phone: editPhone });
        setEditing(false);
        Alert.alert('✓ Profile Updated', 'Your profile has been saved successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

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
          <Text style={styles.avatarText}>{user.name.split(' ').map((n: string) => n[0]).join('')}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userRole}>{user.role}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      </View>

      {!editing ? (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Phone" value={user.phone || 'Not set'} />
            <InfoRow label="Role" value={user.role} />
            <InfoRow label="ID" value={user.id} />
          </View>

          <View style={styles.section}>
            <TouchableOpacity style={styles.profileActionButton} onPress={() => setEditing(true)}>
              <Text style={[styles.profileActionButtonText, { color: colors.primary }]}>✏️ Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>
          <View style={styles.editField}>
            <Text style={styles.editLabel}>Full Name</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={styles.editInput}
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
          <View style={styles.editField}>
            <Text style={styles.editLabel}>Phone</Text>
            <TextInput
              value={editPhone}
              onChangeText={setEditPhone}
              style={styles.editInput}
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[styles.profileActionButton, { flex: 1 }]} onPress={() => setEditing(false)}>
              <Text style={[styles.profileActionButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.profileActionButton, { flex: 1, backgroundColor: colors.primary }]} onPress={handleSaveProfile} disabled={saving}>
              <Text style={[styles.profileActionButtonText, { color: colors.background }]}>{saving ? '...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity style={styles.profileActionButton} onPress={handleLogout}>
          <Text style={[styles.profileActionButtonText, { color: colors.destructive }]}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    jobAlerts: true,
    inventoryAlerts: true,
    systemAlerts: true,
  });

  const handleTogglePreference = async (key: keyof typeof prefs): Promise<void> => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    try {
      await AsyncStorage.setItem('notification_prefs', JSON.stringify(newPrefs));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  };

  return (
    <ScrollView>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alert Preferences</Text>
        <SettingRow label="Job Alerts" value={prefs.jobAlerts} onToggle={() => handleTogglePreference('jobAlerts')} />
        <SettingRow label="Inventory Alerts" value={prefs.inventoryAlerts} onToggle={() => handleTogglePreference('inventoryAlerts')} />
        <SettingRow label="System Alerts" value={prefs.systemAlerts} onToggle={() => handleTogglePreference('systemAlerts')} />
      </View>
    </ScrollView>
  );
}

function SettingRow({ label, value, onToggle, subtitle }: { label: string; value: boolean; onToggle: (v: boolean) => void; subtitle?: string }) {
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingLabel}>{label}</Text>
        {subtitle && <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 2 }}>{subtitle}</Text>}
      </View>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: colors.card, true: colors.primary }} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabContainer: { flexDirection: 'row', backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabIcon: { fontSize: 18, marginBottom: 4 },
  tabLabel: { fontSize: 12, color: colors.mutedForeground },
  tabLabelActive: { color: colors.primary, fontWeight: '600' },
  content: { flex: 1 },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.primary, marginBottom: 12 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  settingLabel: { fontSize: 14, color: colors.foreground },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: 13, color: colors.mutedForeground },
  infoValue: { fontSize: 13, color: colors.foreground, fontWeight: '500' },
  profileHeader: { flexDirection: 'row', padding: 16, backgroundColor: colors.card, alignItems: 'center', gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: colors.background },
  userName: { fontSize: 16, fontWeight: '600', color: colors.foreground },
  userRole: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  userEmail: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  actionButton: { padding: 12, backgroundColor: colors.primary, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: colors.background, fontWeight: '600' },
  dangerButton: { padding: 12, backgroundColor: colors.destructive + '20', borderRadius: 8, alignItems: 'center' },
  dangerButtonText: { color: colors.destructive, fontWeight: '600' },
  profileActionButton: { padding: 12, backgroundColor: colors.card, borderRadius: 8, alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  profileActionButtonText: { fontWeight: '600' },
  aboutCard: { backgroundColor: colors.card, padding: 16, borderRadius: 8, alignItems: 'center' },
  aboutTitle: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 4 },
  aboutVersion: { fontSize: 12, color: colors.mutedForeground, marginBottom: 8 },
  aboutDesc: { fontSize: 12, color: colors.foreground, textAlign: 'center', marginBottom: 4 },
  aboutCopy: { fontSize: 11, color: colors.mutedForeground },
  frequencyOptions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  freqButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.card, borderRadius: 6, borderWidth: 1, borderColor: colors.border },
  freqButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  freqText: { fontSize: 11, color: colors.foreground },
  freqTextActive: { color: colors.background, fontWeight: '600' },
  editField: { marginBottom: 12 },
  editLabel: { fontSize: 12, fontWeight: '600', color: colors.foreground, marginBottom: 6 },
  editInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, color: colors.foreground, backgroundColor: colors.card, marginBottom: 8 },
});
