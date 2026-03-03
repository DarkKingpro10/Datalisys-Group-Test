import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
	weight: ["400", "500", "600", "700"],
	subsets: ["latin"],
	fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
	title: "Commercial KPI Dashboard",
	description: "Panel comercial con KPIs, tendencias y rankings",
};

const themeInitScript = `
(() => {
	const key = "kpi-dashboard-theme";
	const root = document.documentElement;
	const savedTheme = localStorage.getItem(key);
	const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const mode = savedTheme === "light" || savedTheme === "dark" || savedTheme === "system" ? savedTheme : "system";
	const resolved = mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode;

	root.classList.remove("light", "dark");
	root.classList.add(resolved);
	root.setAttribute("data-theme-mode", mode);
})();
`;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
			</head>
			<body suppressHydrationWarning className={`antialiased ${poppins.className}`}>
				{children}
			</body>
		</html>
	);
}
