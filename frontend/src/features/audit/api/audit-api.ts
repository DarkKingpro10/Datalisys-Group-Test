import { fetchApi } from "@/shared/utils/fetchApi";
import {
	AuditPaymentsResponse,
	PaymentQueryParams,
} from "../types/PaymentAudit.type";

const ALLOWED_SORT_FIELDS = new Set([
    "order_id",
    "detected_at",
    "total_payments",
    "payments_count",
]);

function normalizeSortParams(params: PaymentQueryParams): {
    sortBy?: string;
    sortDirection?: "asc" | "desc";
} {
    const rawSortBy = params.sortBy;
    if (!rawSortBy) {
        return {
            sortBy: undefined,
            sortDirection:
                params.sortDirection === "asc" || params.sortDirection === "desc"
                    ? params.sortDirection
                    : undefined,
        };
    }

    if (rawSortBy.includes(".")) {
        const [field, direction] = rawSortBy.split(".");
        if (
            field &&
            ALLOWED_SORT_FIELDS.has(field) &&
            (direction === "asc" || direction === "desc")
        ) {
            return { sortBy: field, sortDirection: direction };
        }
        return {};
    }

    if (!ALLOWED_SORT_FIELDS.has(rawSortBy)) {
        return {};
    }

    const normalizedDirection =
        params.sortDirection === "asc" || params.sortDirection === "desc"
            ? params.sortDirection
            : undefined;

    return {
        sortBy: rawSortBy,
        sortDirection: normalizedDirection,
    };
}

export function getAuditPaymentsWithoutItems(params: PaymentQueryParams) {
    const query = new URLSearchParams();
    const { sortBy, sortDirection } = normalizeSortParams(params);

    if (params.page) query.append("page", params.page);
    if (params.pageSize) query.append("pageSize", params.pageSize.toString());
    if (sortBy) query.append("sortBy", sortBy);
    if (sortDirection) query.append("sortDirection", sortDirection);
    if (params.search) query.append("search", params.search);

    const url = "/audit/payments-without-items?" + query.toString();

    return fetchApi<AuditPaymentsResponse>(url, { revalidate: 60 });
}
