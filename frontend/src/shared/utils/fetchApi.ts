import { resolveAPIURL } from "./resolve-api";

export type FetchOptions = {
	revalidate?: number;
	timeoutMs?: number;
};


export async function fetchApi<T>(path: string, options?: FetchOptions): Promise<T> {
	const controller = new AbortController();
	const timeoutMs = options?.timeoutMs ?? 10000;
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	const baseUrl = resolveAPIURL().replace(/\/+$/, "");
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const url = `${baseUrl}${normalizedPath}`;

	let response: Response;

	try {
		const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
			signal: controller.signal,
		};

		if (typeof options?.revalidate === "number") {
			fetchOptions.next = { revalidate: options.revalidate };
		}

		response = await fetch(url, fetchOptions);
	} catch (error) {
		clearTimeout(timeout);

		if (error instanceof Error && error.name === "AbortError") {
			throw new Error(`Timeout al consultar backend (${timeoutMs}ms) en ${path}`);
		}

		throw new Error(`No se pudo conectar con el backend en ${url} ${error}`);
	}

	clearTimeout(timeout);

	if (!response.ok) {
		throw new Error(`Error ${response.status} al consultar ${path}`);
	}

	return response.json() as Promise<T>;
}