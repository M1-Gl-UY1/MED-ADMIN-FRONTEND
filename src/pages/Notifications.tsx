import { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  Tag,
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { Card, CardContent, Button, Badge, EmptyState } from '../components/ui';
import { useNotifications } from '../context/NotificationContext';

// Icones par type de notification
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'NOUVELLE_COMMANDE':
    case 'COMMANDE_VALIDEE':
    case 'COMMANDE_LIVREE':
    case 'COMMANDE_ANNULEE':
      return ShoppingCart;
    case 'STOCK_FAIBLE':
    case 'RUPTURE_STOCK':
      return Package;
    case 'NOUVEAU_VEHICULE':
    case 'PRIX_MODIFIE':
    case 'PROMOTION':
      return Tag;
    case 'NOUVELLE_INSCRIPTION':
      return Users;
    default:
      return Bell;
  }
};

// Couleurs par type de notification
const getNotificationColor = (type: string) => {
  switch (type) {
    case 'NOUVELLE_COMMANDE':
      return 'bg-blue-100 text-blue-600';
    case 'COMMANDE_VALIDEE':
    case 'COMMANDE_LIVREE':
      return 'bg-green-100 text-green-600';
    case 'COMMANDE_ANNULEE':
      return 'bg-red-100 text-red-600';
    case 'STOCK_FAIBLE':
    case 'RUPTURE_STOCK':
      return 'bg-orange-100 text-orange-600';
    case 'NOUVEAU_VEHICULE':
    case 'PROMOTION':
      return 'bg-purple-100 text-purple-600';
    case 'PRIX_MODIFIE':
      return 'bg-yellow-100 text-yellow-600';
    case 'NOUVELLE_INSCRIPTION':
      return 'bg-teal-100 text-teal-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.lu)
    : notifications;

  const handleNotificationClick = async (notification: any) => {
    if (!notification.lu) {
      await markAsRead(notification.id);
    }
    if (notification.lien) {
      navigate(notification.lien);
    }
  };

  return (
    <div>
      <Header
        title="Notifications"
        subtitle={`${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`}
      />

      <div className="p-4 sm:p-6">
        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Connection status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              isConnected
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Connecte</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>Deconnecte</span>
                </>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filter === 'all'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filter === 'unread'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                Non lues ({unreadCount})
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshNotifications}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={markAllAsRead}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
            <Button variant="outline" size="sm" onClick={refreshNotifications} className="ml-auto">
              Reessayer
            </Button>
          </div>
        )}

        {/* Loading */}
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-secondary mx-auto mb-4" />
              <p className="text-gray-500">Chargement des notifications...</p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Aucune notification"
            description={
              filter === 'unread'
                ? "Vous n'avez pas de notifications non lues"
                : "Vous n'avez pas encore recu de notifications"
            }
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type);

                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.lu ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Icon */}
                      <div className={`p-3 rounded-xl ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className={`font-medium text-primary ${!notification.lu ? 'font-semibold' : ''}`}>
                              {notification.titre}
                            </h4>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.lu && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="default" className="text-xs">
                            {notification.typeLabel}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {notification.tempsEcoule}
                          </span>
                          {notification.lien && (
                            <span className="text-xs text-secondary flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              Voir
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {!notification.lu && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Marquer comme lu"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
