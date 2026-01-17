import apiClient from './api';

export interface NotificationDTO {
  id: number;
  type: string;
  titre: string;
  message: string;
  destinataireId: number | null;
  destinataireType: 'ADMIN' | 'CLIENT' | 'SOCIETE' | 'ALL';
  lien: string;
  lu: boolean;
  dateCreation: string;
  dateLecture: string | null;
  typeLabel: string;
  tempsEcoule: string;
}

export interface NotificationCount {
  count: number;
}

class NotificationService {
  /**
   * Recuperer toutes les notifications admin
   */
  async getAll(): Promise<NotificationDTO[]> {
    const response = await apiClient.get<NotificationDTO[]>('/api/notifications/admin');
    return response.data;
  }

  /**
   * Recuperer les notifications non lues
   */
  async getUnread(): Promise<NotificationDTO[]> {
    const response = await apiClient.get<NotificationDTO[]>('/api/notifications/admin/unread');
    return response.data;
  }

  /**
   * Compter les notifications non lues
   */
  async countUnread(): Promise<number> {
    const response = await apiClient.get<NotificationCount>('/api/notifications/admin/count');
    return response.data.count;
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(id: number): Promise<void> {
    await apiClient.put(`/api/notifications/${id}/read`);
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.put('/api/notifications/admin/read-all');
  }

  /**
   * Supprimer une notification
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/notifications/${id}`);
  }
}

export const notificationService = new NotificationService();
