type MessageLevel = 'success' | 'warning' | 'error' | 'info' | 'message';

interface ToastMessage {
  id: string;
  level: MessageLevel;
  message: string;
  createdDate: Date;
}
