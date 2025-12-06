import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeDatabase, loginUser, registerUser } from './db';

export interface User {
  id?: number;
  email: string;
  phone?: string;
  role: 'Technician' | 'TeamLead' | 'Manager' | 'Admin';
  technicianId?: string;
  full_name?: string;
}

const AUTH_KEY = 'fibertrace_user';

export async function saveUser(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user:', error);
    throw new Error('Failed to save session. Please try again.');
  }
}

export async function getStoredUser(): Promise<User | null> {
  try {
    const data = await AsyncStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get stored user:', error);
    return null;
  }
}

export async function clearUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
  } catch (error) {
    console.error('Failed to clear user:', error);
  }
}

export async function isLoggedIn(): Promise<boolean> {
  const user = await getStoredUser();
  return !!user;
}

export async function verifyCredentials(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    await initializeDatabase();
    
    const result = await loginUser(email, password) as { success: boolean; user: any; error?: string };
    
    if (result.success && result.user) {
      const user: User = {
        id: result.user.id,
        email: result.user.email,
        role: mapRole(result.user.role),
        full_name: result.user.full_name,
        technicianId: `tech-${result.user.id || Date.now()}`,
      };
      return { success: true, user };
    }
    
    return { success: false, error: 'Invalid credentials' };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.error || error.message || 'Login failed' };
  }
}

export async function registerAccount(fullName: string, email: string, password: string, phone?: string): Promise<User> {
  try {
    await initializeDatabase();
    
    const result = await registerUser({
      full_name: fullName,
      email,
      password,
      phone,
      role: 'technician'
    }) as { success: boolean; user: any; error?: string };
    
    if (result.success && result.user) {
      return {
        id: result.user.id,
        email: result.user.email,
        role: mapRole(result.user.role),
        full_name: result.user.full_name,
        technicianId: `tech-${result.user.id || Date.now()}`,
      };
    }
    
    throw new Error('Registration failed');
  } catch (error: any) {
    console.error('Registration failed:', error);
    throw new Error(error.error || error.message || 'Registration failed');
  }
}

export async function resetPassword(email: string, newPassword: string): Promise<boolean> {
  console.log('Password reset requested for:', email);
  return true;
}

function mapRole(role: string): 'Technician' | 'TeamLead' | 'Manager' | 'Admin' {
  const roleMap: Record<string, 'Technician' | 'TeamLead' | 'Manager' | 'Admin'> = {
    'technician': 'Technician',
    'field_tech': 'Technician',
    'team_lead': 'TeamLead',
    'manager': 'Manager',
    'admin': 'Admin',
  };
  return roleMap[role?.toLowerCase()] || 'Technician';
}
