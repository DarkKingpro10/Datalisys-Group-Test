import express from "express";
import { prisma } from "./db";

const app = express();
const port = process.env.BACKEND_PORT ? Number(process.env.BACKEND_PORT) : 3001;

app.get("/health", (req, res) => {
	res.json({ status: "ok" });
});

app.get("/dbtest", async (req, res) => {
	try {
		// Simple DB test: ask Postgres for current timestamp
		const now = await prisma.$queryRaw`SELECT now() as now`;
		res.json({ success: true, now });
	} catch (err) {
		res.status(500).json({ success: false, error: String(err) });
	}
});

async function start() {
	try {
		await prisma.$connect();
		app.listen(port, () => {
			// eslint-disable-next-line no-console
			console.log(`Backend listening on http://localhost:${port}`);
		});
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error("Failed to start server:", err);
		process.exit(1);
	}
}

process.on("SIGINT", async () => {
	await prisma.$disconnect();
	process.exit(0);
});

start();
