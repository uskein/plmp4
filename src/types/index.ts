export interface Collection {
  id: string;
  name: string;
  parent_id: string | null;
  cover_image: string | null;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  file_path: string;
  collection_id: string | null;
  duration_seconds: number;
  playback_position: number;
  thumbnail_path: string | null;
  last_watched_at: string | null;
  created_at: string;
}

export interface VideoAnnotation {
  id: string;
  video_id: string;
  timestamp_seconds: number;
  note_text: string;
  highlight_color: string;
  created_at: string;
}

export interface VirtualNotebook {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  notebook_id: string;
  content: string;
  position_order: number;
  created_at: string;
}

// ─── Theme System ────────────────────────────────────────────────

export interface ThemeColors {
  // Backgrounds
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgElevated: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;
  // Borders
  borderDefault: string;
  borderStrong: string;
  // Accent
  accent: string;
  accentLight: string;
  accentDark: string;
  // Semantic
  success: string;
  warning: string;
  danger: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  isDefault?: boolean;
}
