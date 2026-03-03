"use client";

import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import useStore from "@/shared/hooks/use-store";
import { type ThemeMode, useThemeStore } from "@/shared/store/theme.store";

const options: { label: string; mode: ThemeMode; Icon: typeof IconSun }[] = [
	{ label: "Claro", mode: "light", Icon: IconSun },
	{ label: "Oscuro", mode: "dark", Icon: IconMoon },
	{ label: "Sistema", mode: "system", Icon: IconDeviceDesktop },
];

export function ThemeToggle() {
	const hydratedMode = useStore(useThemeStore, (state) => state.mode);
	const mode = hydratedMode ?? "system";
	const setMode = useThemeStore((state) => state.setMode);

	return (
		<div className="flex w-full flex-wrap items-center gap-1 rounded-xl border border-border bg-surface-soft p-1 sm:w-auto sm:flex-nowrap">
			{options.map(({ label, mode: optionMode, Icon }) => {
				const isActive = optionMode === mode;

				return (
					<button
						key={optionMode}
						type="button"
						onClick={() => setMode(optionMode)}
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