import api from './api';

export interface RecurringTransaction {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: string;
  endDate?: string;
  nextDate: string;
  lastExecuted?: string;
  note?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const recurringService = {
  // Récupérer toutes les récurrences
  getAll: async (isActive?: boolean) => {
    const params = isActive !== undefined ? { isActive } : {};
    const response = await api.get('/recurring', { params });
    return response.data;
  },

  // Récupérer une récurrence par ID
  getById: async (id: string) => {
    const response = await api.get(`/recurring/${id}`);
    return response.data;
  },

  // Créer une récurrence
  create: async (data: Partial<RecurringTransaction>) => {
    const response = await api.post('/recurring', data);
    return response.data;
  },

  // Mettre à jour une récurrence
  update: async (id: string, data: Partial<RecurringTransaction>) => {
    const response = await api.put(`/recurring/${id}`, data);
    return response.data;
  },

  // Supprimer une récurrence
  delete: async (id: string) => {
    const response = await api.delete(`/recurring/${id}`);
    return response.data;
  },

  // Activer/Désactiver une récurrence
  toggle: async (id: string) => {
    const response = await api.patch(`/recurring/${id}/toggle`);
    return response.data;
  },

  // Exécuter manuellement une récurrence
  execute: async (id: string) => {
    const response = await api.post(`/recurring/${id}/execute`);
    return response.data;
  },
};
