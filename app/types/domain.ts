/**
 * Domain types — re-exports derived from the auto-generated Supabase schema.
 * App code should import from here instead of `lib/database.types` directly.
 */
import type { Database } from '@/lib/database.types';

type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];

// Children
export type Child = Tables['children']['Row'];
export type ChildInsert = Tables['children']['Insert'];
export type ChildUpdate = Tables['children']['Update'];
export type Sex = 'male' | 'female' | 'unspecified';

// Caregivers
export type Caregiver = Tables['caregivers']['Row'];
export type CaregiverRole = Enums['caregiver_role'];

// Feedings
export type Feeding = Tables['feedings']['Row'];
export type FeedingInsert = Tables['feedings']['Insert'];
export type FeedingKind = Enums['feeding_kind'];

// Sleeps
export type Sleep = Tables['sleeps']['Row'];
export type SleepInsert = Tables['sleeps']['Insert'];

// Diapers
export type Diaper = Tables['diapers']['Row'];
export type DiaperInsert = Tables['diapers']['Insert'];
export type DiaperKind = Enums['diaper_kind'];

// Growth measurements
export type GrowthMeasurement = Tables['growth_measurements']['Row'];
export type GrowthMeasurementInsert = Tables['growth_measurements']['Insert'];
export type MeasurementKind = Enums['measurement_kind'];

// Milestones
export type Milestone = Tables['milestones']['Row'];
export type MilestoneTemplate = Tables['milestone_templates']['Row'];

// Reminders
export type Reminder = Tables['reminders']['Row'];
export type ReminderKind = Enums['reminder_kind'];

// Vaccinations
export type Vaccination = Tables['vaccinations']['Row'];

// Photos
export type Photo = Tables['photos']['Row'];
