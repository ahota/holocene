export interface HistoryEvent {
  year: number; // HE
  title: string;
  description: string;
  importance: number; // 0=pinned, 1=trajectory, 2=cultural anchor (zoom>1), 3=texture (zoom>5)
  isToday?: boolean;
}
