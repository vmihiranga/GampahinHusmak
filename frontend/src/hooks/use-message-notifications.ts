import { useEffect, useRef } from 'react';
import { useToast } from './use-toast';

export function useMessageNotifications() {
  const { toast } = useToast();
  const lastMessageCountRef = useRef<number | null>(null);
  const notificationPermission = useRef<NotificationPermission>('default');

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        notificationPermission.current = permission;
      });
    } else if ('Notification' in window) {
      notificationPermission.current = Notification.permission;
    }
  }, []);

  const checkForNewMessages = (currentCount: number, contactsData: any) => {
    // Initialize on first load
    if (lastMessageCountRef.current === null) {
      lastMessageCountRef.current = currentCount;
      return;
    }

    // Check if there are new messages
    if (currentCount > lastMessageCountRef.current) {
      const newMessagesCount = currentCount - lastMessageCountRef.current;
      
      // Show toast notification
      toast({
        title: "📬 New Message",
        description: `You have ${newMessagesCount} new ${newMessagesCount === 1 ? 'message' : 'messages'}`,
        duration: 5000,
      });

      // Show browser notification if permitted
      if (notificationPermission.current === 'granted' && 'Notification' in window) {
        const notification = new Notification('Gampahin Husmak - New Message', {
          body: `You have ${newMessagesCount} new ${newMessagesCount === 1 ? 'message' : 'messages'}`,
          icon: '/favicon.png',
          badge: '/favicon.png',
          tag: 'new-message',
          renotify: true,
        });

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }

      lastMessageCountRef.current = currentCount;
    }
  };

  return { checkForNewMessages };
}
