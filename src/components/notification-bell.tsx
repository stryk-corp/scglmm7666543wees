'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, Wand2, Info, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Notification } from '@/lib/types';

const IconMap: { [key: string]: React.ElementType } = {
  Wand2: Wand2,
  Info: Info,
  AlertTriangle: AlertTriangle,
  default: Info,
};

export function NotificationBell() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [globalNotifications, setGlobalNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !firestore) return;

    // Listener for user-specific notifications
    const userNotificationsRef = collection(firestore, `users/${user.uid}/notifications`);
    const userQuery = query(userNotificationsRef, orderBy('createdAt', 'desc'));
    const unsubscribeUser = onSnapshot(userQuery, (snapshot) => {
      const userNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setUserNotifications(userNotifs);
    });

    // Listener for global notifications
    const globalNotificationsRef = collection(firestore, 'globalNotifications');
    const globalQuery = query(globalNotificationsRef, orderBy('createdAt', 'desc'));
    const unsubscribeGlobal = onSnapshot(globalQuery, (snapshot) => {
      const globalNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setGlobalNotifications(globalNotifs);
    }, (error) => {
      console.error("Error fetching global notifications: ", error);
    });

    return () => {
      unsubscribeUser();
      unsubscribeGlobal();
    };
  }, [user, firestore]);
  
  const allNotifications = useMemo(() => {
    return [...userNotifications, ...globalNotifications].sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || 0;
      const timeB = b.createdAt?.toMillis() || 0;
      return timeB - timeA;
    });
  }, [userNotifications, globalNotifications]);

  useEffect(() => {
    const userUnread = userNotifications.filter(n => !n.isRead).length;
    setUnreadCount(userUnread);
  }, [userNotifications]);

  const handleMarkAsRead = async (notification: Notification) => {
    if (!user || !firestore || notification.isRead) return;
    
    const isUserNotif = userNotifications.some(n => n.id === notification.id);

    if (isUserNotif) {
        try {
            const notifRef = doc(firestore, `users/${user.uid}/notifications`, notification.id);
            await updateDoc(notifRef, { isRead: true });
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={cn("h-5 w-5", unreadCount > 0 && "text-red-500")} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allNotifications.length > 0 ? (
          allNotifications.map((notif) => {
            const Icon = IconMap[notif.icon] || IconMap.default;
            return (
              <DropdownMenuItem key={notif.id} className={cn("flex items-start gap-3 p-3", !notif.isRead && "bg-primary/5")} onSelect={() => handleMarkAsRead(notif)}>
                 {!notif.isRead && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>}
                <Icon className={cn("h-5 w-5 mt-1 flex-shrink-0", { 'ml-3': notif.isRead })} />
                <div className="flex-grow">
                  <p className="font-semibold text-sm">{notif.title}</p>
                  <p className="text-xs text-muted-foreground">{notif.body}</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    {notif.createdAt ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true }) : ''}
                  </p>
                </div>
              </DropdownMenuItem>
            );
          })
        ) : (
          <p className="p-4 text-center text-sm text-muted-foreground">No new notifications.</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
