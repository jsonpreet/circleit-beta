import create from 'zustand';
import { persist } from 'zustand/middleware';


const useApp = create(
    persist(
        (set, get) => ({
            theme: 'dark',
            recentSearch: [],
            isLoggedIn: false,
            isCircle: false,
            user: {},
            setTheme: (params) => {
                set((state) => ({
                    theme: params,
                }));
            },
            setUser: (params) => {
                set((state) => ({
                    user: params,
                }));
            },
            setSearch: (params) => {
                set((prev) => ({
                    recentSearch: params,
                }));
            },
            setLoggedIn: (params) => {
                set((state) => ({
                    isLoggedIn: params,
                }));
            },
            setCircle: (params) => {
                set((state) => ({
                    isCircle: params,
                }));
            },
            resetSearch: () => {
                set((state) => ({
                    recentSearch: [],
                }));
            },
        }),
        { name: 'circleit' }
    )
);
export default useApp;