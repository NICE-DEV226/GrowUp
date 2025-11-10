import { create } from 'zustand';

interface DataState {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

// Store pour déclencher le rafraîchissement des données dans toutes les pages
export const useDataStore = create<DataState>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
