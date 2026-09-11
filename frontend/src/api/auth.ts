import { api, setToken } from './client';
import type { UserProfile, UserRole } from '../types';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
  user_id: string;
  name: string;
}

function mapRole(apiRole: string): UserRole {
  if (apiRole === 'facility_staff') return 'facility';
  if (apiRole === 'cdmo') return 'cdmo';
  return 'asha';
}

function roleMeta(role: UserRole): Pick<UserProfile, 'roleLabel' | 'roleTag' | 'badge' | 'avatarIcon' | 'location'> {
  if (role === 'facility') {
    return {
      roleLabel: 'Facility Staff',
      roleTag: 'Facility',
      badge: 'Arrival confirmation',
      avatarIcon: 'local_hospital',
      location: 'Destination facility',
    };
  }
  if (role === 'cdmo') {
    return {
      roleLabel: 'CDMO',
      roleTag: 'District',
      badge: 'District oversight',
      avatarIcon: 'admin_panel_settings',
      location: 'District HQ',
    };
  }
  return {
    roleLabel: 'ASHA Worker',
    roleTag: 'Field',
    badge: 'Field triage & intake',
    avatarIcon: 'medical_services',
    location: 'Sub-center',
  };
}

export async function login(phone: string, password: string): Promise<UserProfile> {
  const data = await api<LoginResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ phone, password }),
  });
  setToken(data.access_token);
  const role = mapRole(data.role);
  const meta = roleMeta(role);
  return {
    id: data.user_id,
    name: data.name,
    role,
    phone,
    ...meta,
  };
}

export function logout(): void {
  setToken(null);
}
