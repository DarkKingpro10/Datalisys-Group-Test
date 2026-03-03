"use client";

import { useEffect, useState } from "react";
import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";

type ThemeMode = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "kpi-dashboard-theme";

const options: { label: string; mode: ThemeMode; Icon: typeof IconSun }[] = [
	{ label: "Claro", mode: "light", Icon: IconSun },
	{ label: "Oscuro", mode: "dark", Icon: IconMoon },
	{ label: "Sistema", mode: "system", Icon: IconDeviceDesktop },
];

function getSystemTheme(): "light" | "dark" {
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ThemeMode) {
	const root = document.documentElement;
	const resolved = mode === "system" ? getSystemTheme() : mode;

	root.classList.remove("light", "dark");
	root.classList.add(resolved);
	root.setAttribute("data-theme-mode", mode);
	localStorage.setItem(THEME_STORAGE_KEY, mode);
}

function getInitialMode(): ThemeMode {
	if (typeof window === "undefined") {
		return "system";
	}

	const fromDom = document.documentElement.getAttribute("data-theme-mode");
	if (fromDom === "light" || fromDom === "dark" || fromDom === "system") {
		return fromDom;
	}

	const fromStorage = localStorage.getItem(THEME_STORAGE_KEY);
	if (fromStorage === "light" || fromStorage === "dark" || fromStorage === "system") {
		return fromStorage;
	}

	return "system";
}

export function ThemeToggle() {
	const [mode, setMode] = useState<ThemeMode>(getInitialMode);

	useEffect(() => {
		if (mode !== "system") {
			return;
		}

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyTheme("system");

		mediaQuery.addEventListener("change", onChange);
		return () => mediaQuery.removeEventListener("change", onChange);
	}, [mode]);

	function onModeChange(nextMode: ThemeMode) {
		setMode(nextMode);
		applyTheme(nextMode);
	}

	return (
		<div className="flex w-full flex-wrap items-center gap-1 rounded-xl border border-border bg-surface-soft p-1 sm:w-auto sm:flex-nowrap">
			{options.map(({ label, mode: optionMode, Icon }) => {
				const isActive = optionMode === mode;

				return (
					<button
						key={optionMode}
						type="button"
						onClick={() => onModeChange(optionMode)}
						className={`inline-flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition sm:flex-none sm:px-3 ${
							isActive
								? "bg-primary text-primary-foreground"
								: "text-muted hover:bg-surface"
						}`}
						aria-pressed={isActive}
					>
						<Icon size={14} stroke={1.8} />
						{label}
					</button>
				);
			})}
		</div>
	);
}