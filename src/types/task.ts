export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string; // YYYY-MM-DD format
  createdAt: number;
}
