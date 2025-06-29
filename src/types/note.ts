export type Note = {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  pinned?: boolean; // default false,
  reminderDate?: string; // <-- add this
};
