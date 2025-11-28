import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { colors } from '../theme/colors';
import * as AuthStorage from '../lib/authStorage';

interface ProfileData {
  fullName?: string;
  email?: string;
  role?: string;
  id?: number;
}

export function ProfileScreen({ onClose }: { onClose?: () => void }) {
  const [profile, setProfile] = useState<ProfileData>({ fullName: 'User', email: 'user@fibertrace.app', role: 'Technician' });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const user = await AuthStorage.getStoredUser();
      if (user) {
        setProfile({
          fullName: user.full_name || 'Technician',
          email: user.email,
          role: user.role || 'Technician',
          id: user.id,
        });
      }
    };
    loadUser();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Technician Profile</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{profile.fullName}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile.email}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{profile.role}</Text>
        </View>

        {profile.id && (
          <View style={styles.field}>
            <Text style={styles.label}>ID</Text>
            <Text style={styles.value}>{profile.id}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.foreground },
  section: { marginBottom: 24, backgroundColor: colors.card, borderRadius: 8, padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.primary, marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, color: colors.mutedForeground, marginBottom: 4, fontWeight: '600' },
  value: { fontSize: 14, color: colors.foreground },
});
