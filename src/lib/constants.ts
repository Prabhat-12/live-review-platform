export const FEEDBACK_CATEGORIES = [
  { value: 'bug', label: 'Bug', color: '#ef4444' },
  { value: 'ux', label: 'UX Concern', color: '#f97316' },
  { value: 'feature_request', label: 'Feature Request', color: '#8b5cf6' },
  { value: 'general', label: 'General Thought', color: '#3b82f6' },
  { value: 'question', label: 'Question', color: '#22c55e' },
] as const

export const FEEDBACK_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
] as const

export const PROJECT_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'viewer', label: 'Viewer' },
] as const
