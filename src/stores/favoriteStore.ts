import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteStore {
  favorites: number[];
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (id) => {
        set((state) => {
          if (state.favorites.includes(id)) return state;
          return { favorites: [...state.favorites, id] };
        });
      },

      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f !== id),
        }));
      },

      toggleFavorite: (id) => {
        const { favorites } = get();
        if (favorites.includes(id)) {
          set({ favorites: favorites.filter((f) => f !== id) });
        } else {
          set({ favorites: [...favorites, id] });
        }
      },

      isFavorite: (id) => get().favorites.includes(id),
    }),
    {
      name: 'apt-favorites',
    }
  )
);
