import type { Task } from '../types';

class NotificationServiceClass {
  private checkInterval: NodeJS.Timeout | null = null;

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  showNotification(title: string, body: string): void {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });

      setTimeout(() => notification.close(), 5000);
    }
  }

  checkDueTasks(tasks: Task[]): void {
    const now = new Date();

    tasks.forEach((task) => {
      if (!task.due_date) return;

      const dueDate = new Date(task.due_date);
      const timeDiff = dueDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff <= 1 && hoursDiff > 0) {
        this.showNotification(
          'Task Due Soon!',
          `"${task.title}" is due in less than 1 hour`
        );
      } else if (timeDiff < 0 && Math.abs(hoursDiff) <= 1) {
        this.showNotification(
          'Task Overdue!',
          `"${task.title}" is now overdue`
        );
      }
    });
  }

  startDailyCheck(tasks: Task[]): void {
    this.stopDailyCheck();

    this.checkDueTasks(tasks);

    this.checkInterval = setInterval(() => {
      this.checkDueTasks(tasks);
    }, 15 * 60 * 1000); // Check every 15 minutes
  }

  stopDailyCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const NotificationService = new NotificationServiceClass();