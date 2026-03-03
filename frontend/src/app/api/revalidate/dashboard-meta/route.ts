import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { allDashboardMetaTags, type DashboardMetaTag } from "@/features/dashboard/config/cache-tags";

type RequestBody = {
	tags?: string[];
};

function normalizeTags(tags?: string[]): DashboardMetaTag[] {
	if (!tags || tags.length === 0) {
		return allDashboardMetaTags;
	}

	const allowed = new Set(allDashboardMetaTags);
	return tags.filter((tag): tag is DashboardMetaTag => allowed.has(tag as DashboardMetaTag));
}

function isAuthorized(request: Request): boolean {
	const expectedToken = process.env.NEXT_REVALIDATE_TOKEN;
	if (!expectedToken) {
		return true;
	}

	const token = request.headers.get("x-revalidate-token");
	return token === expectedToken;
}

export async function POST(request: Request) {
	if (!isAuthorized(request)) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let body: RequestBody = {};

	try {
		body = (await request.json()) as RequestBody;
	} catch {
		body = {};
	}

	const tagsToRevalidate = normalizeTags(body.tags);

	if (tagsToRevalidate.length === 0) {
		return NextResponse.json(
			{ error: "No se enviaron tags válidos para revalidar." },
			{ status: 400 },
		);
	}

	for (const tag of tagsToRevalidate) {
		revalidateTag(tag, "max");
	}

	return NextResponse.json({ revalidated: true, tags: tagsToRevalidate });
}