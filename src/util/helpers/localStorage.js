import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Create a store with zustand
const useSettingsStore = create(
  persist(
    (set) => ({
      epToken: '',
      epRegion: 'US',
      setEpToken: (token) => set({ epToken: token }),
      setEpRegion: (region) => set({ epRegion: region }),
    }),
    {
      name: 'feeds-settings', // name of the item in storage
      getStorage: () => localStorage,
    }
  )
);

export default useSettingsStore;
