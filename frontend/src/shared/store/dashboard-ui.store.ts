"use client";

import { create } from "zustand";

type DashboardUIState = {
	isSidebarOpen: boolean;
	toggleSidebar: () => void;
	openSidebar: () => void;
	closeSidebar: () => void;
};

export const useDashboardUIStore = create<DashboardUIState>((set) => ({
	isSidebarOpen: true,
	toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
	openSidebar: () => set({ isSidebarOpen: true }),
	closeSidebar: () => set({ isSidebarOpen: false }),
}));
