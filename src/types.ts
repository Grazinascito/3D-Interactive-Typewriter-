export interface KeyConfig {
  id: string;
  char: string;
  shiftChar?: string;
  code: string;
  row: number;
  col: number;
  width?: number; // default 1 (round), spacebar is wide
  isSpecial?: boolean;
  colorType?: 'dark' | 'sage';
  label: string;
  subLabel?: string;
}

export type CameraViewPreset = 'studio' | 'top' | 'side' | 'platen' | 'typebars';

export interface TypewriterState {
  lines: string[];
  currentCol: number;
  maxCols: number;
  maxLines: number;
  isCarriageMoving: boolean;
  soundEnabled: boolean;
  badgeText: string;
  activeKeyId: string | null;
  typebarStriking: boolean;
  cameraPreset: CameraViewPreset;
}
