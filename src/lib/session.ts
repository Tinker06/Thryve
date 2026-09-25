import { supabase } from './supabase';
import { getCurrentProfile } from './auth';
import type { Profile } from './types';

export interface Project {
  id: string;
  team_id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  status: string;
  created_at: string;
}

export async function loadSessionProfile(): Promise<Profile | null> {
  return (await getCurrentProfile()) as Profile | null;
}

export async function loadMyProjects(teamId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, team_id, name, description, created_by, status, created_at')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []) as Project[];
}

export async function createProject(
  teamId: string,
  userId: string,
  name: string,
  description: string
): Promise<Project> {
  const response = await fetch('/.netlify/functions/create-project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      teamId,
      requestedByUserId: userId,
      name,
      description,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Could not create project');
  }

  return result.project as Project;
}