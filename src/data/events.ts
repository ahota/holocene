export interface HistoryEvent {
  year: number; // HE
  title: string;
  description: string;
  importance: number; // 1 = trajectory (always shown), 2 = cultural anchor (zoom > 1), 3 = quiet texture (zoom > 5)
  isToday?: boolean;
}
