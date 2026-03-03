"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/shared/store/theme.store";

type Props = {
	children: React.ReactNode;
};

function applyThemeClasses(resolvedTheme: "light" | "dark", mode: "light" | "dark" | "system") {
	const root = document.documentElement;
	root.classList.remove("light", "dark");
	root.classList.add(resolvedTheme);
	root.setAttribute("data-theme-mode", mode);
}

export function ThemeProvider({ children }: Props) {
	const mode = useThemeStore((state) => state.mode);
	const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
	const hydrate = useThemeStore((state) => state.hydrate);
	const setResolvedTheme = useThemeStore((state) => state.setResolvedTheme);

	useEffect(() => {
		hydrate();
	}, [hydrate]);

	useEffect(() => {
		applyThemeClasses(resolvedTheme, mode);
	}, [mode, resolvedTheme]);

	useEffect(() => {
		if (mode !== "system") {
			return;
		}

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = (event: MediaQueryListEvent) => {
			setResolvedTheme(event.matches ? "dark" : "light");
		};

		mediaQuery.addEventListener("change", onChange);
		return () => mediaQuery.removeEventListener("change", onChange);
	}, [mode, setResolvedTheme]);

	return children;
}