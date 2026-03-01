import express from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./db.js";

const app = express();
const port = process.env.BACKEND_PORT ? Number(process.env.BACKEND_PORT) : 8000;

const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(
	cors({
		origin: allowedOrigin,
	})
);

// Security headers
app.use(helmet());

app.get("/health", (req, res) => {
	res.json({ status: "ok", message: "Backend is running maybe!" });
});

app.get("/dbtest", async (req, res) => {
	try {
		// Simple DB test: ask Postgres for current timestamp
		const now = await prisma.dimProduct.findMany();
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
