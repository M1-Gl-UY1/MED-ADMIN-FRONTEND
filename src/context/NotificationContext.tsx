import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { notificationService, type NotificationDTO } from '../services/notification.service';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationDTO[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  // Charger les notifications depuis l'API
  const refreshNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const [allNotifs, count] = await Promise.all([
        notificationService.getAll(),
        notificationService.countUnread()
      ]);
      setNotifications(allNotifs);
      setUnreadCount(count);
      setError(null);
    } catch (err: any) {
      console.error('Erreur chargement notifications:', err);
      setError('Impossible de charger les notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connexion WebSocket
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Charger les notifications initiales
    refreshNotifications();

    // Configurer le client STOMP
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('[STOMP]', str);
      },
      onConnect: () => {
        console.log('[WebSocket] Connecte');
        setIsConnected(true);

        // S'abonner aux notifications admin
        client.subscribe('/topic/notifications/admin', (message) => {
          try {
            const notification: NotificationDTO = JSON.parse(message.body);
            console.log('[WebSocket] Nouvelle notification:', notification);

            // Ajouter la notification en haut de la liste
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Jouer un son de notification (optionnel)
            playNotificationSound();
          } catch (err) {
            console.error('Erreur parsing notification:', err);
          }
        });
      },
      onDisconnect: () => {
        console.log('[WebSocket] Deconnecte');
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('[WebSocket] Erreur STOMP:', frame.headers['message']);
        setIsConnected(false);
      },
      onWebSocketError: (event) => {
        console.error('[WebSocket] Erreur WebSocket:', event);
        setIsConnected(false);
      }
    });

    stompClientRef.current = client;
    client.activate();

    // Nettoyage
    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [isAuthenticated, refreshNotifications]);

  // Jouer un son de notification
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignorer les erreurs de lecture audio (autoplay bloque)
      });
    } catch {
      // Ignorer si le fichier n'existe pas
    }
  };

  // Marquer comme lue
  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, lu: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erreur markAsRead:', err);
    }
  }, []);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur markAllAsRead:', err);
    }
  }, []);

  // Supprimer une notification
  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationService.delete(id);
      const wasUnread = notifications.find(n => n.id === id && !n.lu);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Erreur deleteNotification:', err);
    }
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        isLoading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Valeurs par defaut pour quand le contexte n'est pas disponible
const defaultContextValue: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  isLoading: false,
  error: null,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  refreshNotifications: async () => {},
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  // Retourner les valeurs par defaut si le contexte n'est pas disponible
  // (par exemple sur la page de login)
  if (context === undefined) {
    return defaultContextValue;
  }
  return context;
}
