import { create } from 'zustand';

interface User {
  address: string | null;
  username: string | null;
  avatar: string | null;
  chain: 'stacks' | 'base' | null;
  balance: string | null;
  isConnected: boolean;
}

interface ThemeStore {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

interface NotificationStore {
  notifications: any[];
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
}

// User Store
export const useUserStore = create<{
  user: User;
  setUser: (user: User) => void;
  logout: () => void;
}>((set) => ({
  user: {
    address: null,
    username: null,
    avatar: null,
    chain: null,
    balance: null,
    isConnected: false
  },
  setUser: (user) => set({ user }),
  logout: () => set({
    user: {
      address: null,
      username: null,
      avatar: null,
      chain: null,
      balance: null,
      isConnected: false
    }
  })
}));

// Theme Store
export const useThemeStore = create<ThemeStore>((set) => ({
  isDarkMode: localStorage.getItem('theme') === 'dark' || false,
  toggleTheme: () => set((state) => {
    const newMode = !state.isDarkMode;
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
    return { isDarkMode: newMode };
  })
}));

// Notification Store
export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { ...notification, id: Date.now().toString() }]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  }))
}));
