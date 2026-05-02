import { StateCreator } from 'zustand';

export interface UISlice {
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  isLive: boolean;
  setIsLive: (isLive: boolean) => void;

  dragActive: boolean;
  setDragActive: (active: boolean) => void;

  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: (open: boolean) => void;

  // KillSwitch state
  isMaintenanceMode: boolean;
  setMaintenanceMode: (active: boolean) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  isLive: false,
  setIsLive: (isLive) => set({ isLive }),

  dragActive: false,
  setDragActive: (dragActive) => set({ dragActive }),

  isChangePasswordModalOpen: false,
  setIsChangePasswordModalOpen: (isChangePasswordModalOpen) => set({ isChangePasswordModalOpen }),

  isMaintenanceMode: false,
  setMaintenanceMode: (isMaintenanceMode) => set({ isMaintenanceMode }),
});
