import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Switch } from 'react-native';
import { colors } from '../theme/colors';

interface ProfileData {
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  organization?: string;
  profilePhotoUrl?: string;
  emailVerified: boolean;
  tosAccepted: boolean;
  dataRetention: number; // days
}

export function ProfileScreen({ onClose }: { onClose?: () => void }) {
  const [profile, setProfile] = useState<ProfileData>({
    fullName: 'User',
    email: 'user@fibertrace.app',
    role: 'Administrator',
    emailVerified: false,
    tosAccepted: false,
    dataRetention: 90,
  });
  const [editing, setEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);
  const [showTOS, setShowTOS] = useState(false);

  const handleSaveProfile = async () => {
    // Validate email uniqueness - in real app, call backend
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(tempProfile.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setProfile(tempProfile);
    setEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleVerifyEmail = async () => {
    try {
      const response = await fetch('https://api.fibertrace.app/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email }),
      });

      if (response.ok) {
        Alert.alert('OTP Sent', `Verification code sent to ${profile.email}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code');
    }
  };

  const TOSModal = () => (
    <ScrollView style={styles.tosContainer}>
      <Text style={styles.tosTitle}>Terms of Service</Text>
      <Text style={styles.tosText}>
        1. ACCEPTANCE OF TERMS{'\n'}
        By accessing FiberTrace, you accept and agree to be bound by the terms and provision of this agreement.{'\n\n'}
        2. DATA INTEGRITY & SECURITY{'\n'}
        Users commit to maintaining data integrity. Single-use email verification ensures account security.{'\n\n'}
        3. OFFLINE-FIRST COMPLIANCE{'\n'}
        All data stored offline must comply with local regulations and security standards.{'\n\n'}
        4. LIABILITY LIMITATION{'\n'}
        FiberTrace is provided on an "AS IS" basis without warranties or guarantees.{'\n\n'}
        5. CONTACT{'\n'}
        For support: support@fibertrace.app
      </Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => setShowTOS(false)}>
        <Text style={styles.buttonText}>Accept & Close</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile Management</Text>
        {!editing && <TouchableOpacity onPress={() => setEditing(true)}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>}
      </View>

      {!showTOS ? (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={tempProfile.fullName}
                  onChangeText={(text) => setTempProfile({ ...tempProfile, fullName: text })}
                  placeholder="Your full name"
                />
              ) : (
                <Text style={styles.value}>{profile.fullName}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={tempProfile.email}
                  onChangeText={(text) => setTempProfile({ ...tempProfile, email: text })}
                  placeholder="your@email.com"
                  keyboardType="email-address"
                />
              ) : (
                <Text style={styles.value}>{profile.email}</Text>
              )}
              {!profile.emailVerified && (
                <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyEmail}>
                  <Text style={styles.verifyButtonText}>Verify Email</Text>
                </TouchableOpacity>
              )}
              <Text style={profile.emailVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
                {profile.emailVerified ? '✓ Verified' : '✗ Unverified'}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Role</Text>
              <Text style={styles.value}>{profile.role}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Organization</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={tempProfile.organization}
                  onChangeText={(text) => setTempProfile({ ...tempProfile, organization: text })}
                  placeholder="Your organization"
                />
              ) : (
                <Text style={styles.value}>{profile.organization || 'Not set'}</Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences & Compliance</Text>

            <View style={styles.preferenceRow}>
              <Text style={styles.label}>Accept Terms of Service</Text>
              <Switch
                value={tempProfile.tosAccepted}
                onValueChange={(val) => setTempProfile({ ...tempProfile, tosAccepted: val })}
                disabled={!editing}
              />
            </View>

            <TouchableOpacity style={styles.tosLink} onPress={() => setShowTOS(true)}>
              <Text style={styles.tosLinkText}>View Terms of Service</Text>
            </TouchableOpacity>

            <View style={styles.field}>
              <Text style={styles.label}>Data Retention (days)</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={tempProfile.dataRetention.toString()}
                  onChangeText={(text) => setTempProfile({ ...tempProfile, dataRetention: parseInt(text) || 90 })}
                  keyboardType="number-pad"
                />
              ) : (
                <Text style={styles.value}>{profile.dataRetention} days</Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }]}>
              <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.destructive, marginTop: 12 }]}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {editing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary, flex: 1 }]} onPress={handleSaveProfile}>
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.mutedForeground, flex: 1, marginLeft: 8 }]} onPress={() => setEditing(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>🌐 Your data integrity is our priority</Text>
            <Text style={styles.copyrightText}>© 2024 FiberTrace • Security & Privacy First</Text>
          </View>
        </>
      ) : (
        <TOSModal />
      )}
    </ScrollView>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  editButton: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    color: colors.mutedForeground,
    paddingVertical: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    color: colors.foreground,
  },
  verifyButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  verifyButtonText: {
    color: colors.primaryForeground,
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedBadge: {
    marginTop: 8,
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  unverifiedBadge: {
    marginTop: 8,
    color: colors.destructive,
    fontSize: 12,
    fontWeight: '600',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tosLink: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  tosLinkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  tosContainer: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 20,
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 16,
  },
  tosText: {
    fontSize: 12,
    color: colors.mutedForeground,
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
});
