import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const THEME_STORAGE_KEY = "kpi-dashboard-theme";

type ThemeState = {
	mode: ThemeMode;
	resolvedTheme: ResolvedTheme;
	setMode: (mode: ThemeMode) => void;
	setResolvedTheme: (resolvedTheme: ResolvedTheme) => void;
	hydrate: () => void;
};

function getSystemTheme(): ResolvedTheme {
	if (typeof window === "undefined") {
		return "light";
	}

	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredMode(): ThemeMode {
	if (typeof window === "undefined") {
		return "system";
	}

	const savedMode = localStorage.getItem(THEME_STORAGE_KEY);
	if (savedMode === "light" || savedMode === "dark" || savedMode === "system") {
		return savedMode;
	}

	return "system";
}

export const useThemeStore = create<ThemeState>((set) => ({
	mode: "system",
	resolvedTheme: "light",
	setMode: (mode) => {
		if (typeof window !== "undefined") {
			localStorage.setItem(THEME_STORAGE_KEY, mode);
		}

		set(() => ({
			mode,
			resolvedTheme: mode === "system" ? getSystemTheme() : mode,
		}));
	},
	setResolvedTheme: (resolvedTheme) => {
		set(() => ({
			resolvedTheme,
		}));
	},
	hydrate: () => {
		const mode = getStoredMode();
		set(() => ({
			mode,
			resolvedTheme: mode === "system" ? getSystemTheme() : mode,
		}));
	},
}));

export { THEME_STORAGE_KEY };