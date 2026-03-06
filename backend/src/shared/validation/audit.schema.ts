import { z } from "zod";

export const paymentQuerySchema = z.object({
	page: z.coerce.number().int().positive().optional(),
	pageSize: z.coerce.number().int().positive().optional(),
	sortBy: z
		.enum(["order_id", "detected_at", "total_payments", "payments_count"])
		.optional(),
	sortDirection: z.enum(["asc", "desc"]).optional(),
	search: z.string().optional(),
});
