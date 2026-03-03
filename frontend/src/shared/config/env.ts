import { z, ZodError } from "zod";

const envSchema = z.object({
	API_URL: z.string("La URL del backend es requerida"),
	FRONTEND_PORT: z.string().default("3000"),
	SERVER_API_URL: z.string().default("http://backend:8000/api"),
});

function validateEnv() {
	try {
		const result = envSchema.parse({
			API_URL: process.env.NEXT_PUBLIC_API_URL,
			FRONTEND_PORT: process.env.NEXT_PUBLIC_FRONTEND_PORT,
			SERVER_API_URL: process.env.SERVER_API_URL,
		});
		return result;
	} catch (error) {
		if (error instanceof ZodError) {
			const errorMessages = error.issues.map(
				(issue) => `${issue.path.join(".")}: ${issue.message}`,
			);

			throw new Error(
				` Variables de entorno inválidas:\n${errorMessages.join("\n")}`,
			);
		}

		throw error;
	}
}

// Exportar configuración validada
export const envConfig = validateEnv();

// Exportar tipos inferidos de Zod
export type EnvironmentConfig = z.infer<typeof envSchema>;