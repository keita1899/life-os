export interface NotificationItem {
  id: string
  type: 'event' | 'task' | 'habit'
  title: string
  scheduledTime: Date
}
