import { envConfig } from "../config/env";

export function resolveAPIURL(): string {
  if (typeof window === "undefined") {
    return envConfig.SERVER_API_URL;
  }

  return envConfig.API_URL;
}