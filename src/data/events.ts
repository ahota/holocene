export interface HistoryEvent {
  year: number; // HE
  title: string;
  description: string;
  importance: number; // 1-3 for adaptive labeling
  isToday?: boolean;
}
