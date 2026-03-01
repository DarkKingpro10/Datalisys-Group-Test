import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlDir = path.resolve(__dirname, "../../sql");
const scripts = [
	"01-schemas.sql",
	"02-raw_tables.sql",
	"03-clean_tables.sql",
	"04-dwh_tables.sql",
];

async function run() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		console.error("DATABASE_URL no está definido en el entorno");
		process.exit(1);
	}

	const client = new Client({ connectionString: databaseUrl });
	await client.connect();

	try {
		for (const script of scripts) {
			const filePath = path.join(sqlDir, script);
			console.log(`Ejecutando script: ${script}`);
			const sql = await fs.readFile(filePath, "utf8");
			// Ejecutar el contenido entero. Los scripts están diseñados para ser idempotentes.
			await client.query(sql);
			console.log(`OK: ${script}`);
		}
		console.log("ETL completado.");
	} catch (err: any) {
		console.error("Error en ETL:", err.message || err);
		process.exitCode = 2;
	} finally {
		await client.end();
	}
}

// Función utilitaria para permitir ejecutar este script directamente con ts-node o después de compilarlo con tsc pero no desde otro módulo
const thisFile = path.resolve(fileURLToPath(import.meta.url));
const entry = process.argv && process.argv[1] ? path.resolve(process.argv[1]) : '';
const invokedViaTsNode = process.argv.some(
	(a) => typeof a === 'string' && a.endsWith(path.join('src', 'etl', 'index.ts'))
);
if (entry === thisFile || invokedViaTsNode) {
	run();
}
