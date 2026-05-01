export const VISITOR_GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
] as const;

export type VisitorGenderValue = (typeof VISITOR_GENDER_OPTIONS)[number]['value'];

export function formatVisitorGender(value: string | null | undefined): string {
  if (!value) return 'Not specified';
  const normalized = value.trim().toLowerCase();

  if (normalized === 'male') return 'Male';
  if (normalized === 'female') return 'Female';
  if (normalized === 'prefer_not_to_say') return 'Prefer not to say';

  return value;
}
