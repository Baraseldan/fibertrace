import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { colors } from '../theme/colors';

interface EmailConfig {
  gmailAppPassword: string;
  adminEmail: string;
  otpExpiry: number;
  emailVerificationEnabled: boolean;
  singleEmailUse: boolean;
}

export function AdminEmailSettingsScreen({ onClose }: { onClose?: () => void }) {
  const [config, setConfig] = useState<EmailConfig>({
    gmailAppPassword: '',
    adminEmail: 'admin@fibertrace.app',
    otpExpiry: 300,
    emailVerificationEnabled: true,
    singleEmailUse: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    if (!config.gmailAppPassword || !config.adminEmail) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://api.fibertrace.app/api/admin/email-config', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token', // In real app, use JWT
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        Alert.alert('Success', 'Email configuration saved');
        onClose?.();
      } else {
        Alert.alert('Error', 'Failed to save email configuration');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Email Configuration</Text>
        <Text style={styles.subtitle}>Admin Only • Manage OTP & Email Verification</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Google App Password Setup</Text>
        <Text style={styles.info}>
          1. Go to myaccount.google.com{'\n'}
          2. Enable 2-Factor Authentication{'\n'}
          3. Generate an App Password for "Mail"{'\n'}
          4. Paste the 16-character password below
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Gmail App Password *</Text>
          <View style={styles.passwordField}>
            <TextInput
              style={styles.passwordInput}
              placeholder="xxxx xxxx xxxx xxxx"
              placeholderTextColor={colors.mutedForeground}
              value={config.gmailAppPassword}
              onChangeText={(text) => setConfig({ ...config, gmailAppPassword: text })}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showBtn}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.warning}>⚠️ Keep this secure. Never share this password.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email Verification Settings</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Admin Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@fibertrace.app"
            placeholderTextColor={colors.mutedForeground}
            value={config.adminEmail}
            onChangeText={(text) => setConfig({ ...config, adminEmail: text })}
            editable={!loading}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>OTP Expiry Time (seconds)</Text>
          <TextInput
            style={styles.input}
            placeholder="300"
            placeholderTextColor={colors.mutedForeground}
            value={config.otpExpiry.toString()}
            onChangeText={(text) => setConfig({ ...config, otpExpiry: parseInt(text) || 300 })}
            editable={!loading}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.toggleField}>
          <View>
            <Text style={styles.label}>Email Verification Enabled</Text>
            <Text style={styles.description}>Require email verification on registration</Text>
          </View>
          <Switch
            value={config.emailVerificationEnabled}
            onValueChange={(val) => setConfig({ ...config, emailVerificationEnabled: val })}
            disabled={loading}
          />
        </View>

        <View style={styles.toggleField}>
          <View>
            <Text style={styles.label}>Single Email Use</Text>
            <Text style={styles.description}>Prevent duplicate email registrations (Data Integrity)</Text>
          </View>
          <Switch
            value={config.singleEmailUse}
            onValueChange={(val) => setConfig({ ...config, singleEmailUse: val })}
            disabled={loading}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security & Compliance</Text>
        <View style={styles.complianceBox}>
          <Text style={styles.complianceText}>✓ One-time email use ensures data integrity</Text>
          <Text style={styles.complianceText}>✓ OTP sent via secure Gmail connection</Text>
          <Text style={styles.complianceText}>✓ Admin-only settings prevent unauthorized changes</Text>
          <Text style={styles.complianceText}>✓ All data stored securely in PostgreSQL</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
          onPress={handleSaveSettings}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Save Configuration</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.mutedForeground, opacity: loading ? 0.6 : 1, marginTop: 8 }]}
          onPress={onClose}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>🔐 Admin settings are encrypted and securely stored</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  subtitle: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
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
    marginBottom: 12,
  },
  info: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 16,
    lineHeight: 18,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 6,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 8,
  },
  description: {
    fontSize: 11,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    color: colors.foreground,
    fontSize: 14,
  },
  passwordField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    color: colors.foreground,
    fontSize: 14,
  },
  showBtn: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  warning: {
    fontSize: 11,
    color: colors.destructive,
    marginTop: 6,
    fontStyle: 'italic',
  },
  toggleField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  complianceBox: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  complianceText: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  actionButtons: {
    padding: 20,
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
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
});
