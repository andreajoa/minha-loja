import { NextResponse } from "next/server";
import { getAnalyticsSql, hasAnalyticsDatabase } from "@/lib/analytics-db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasAnalyticsDatabase()) {
    return NextResponse.json({ ok: false, configured: false }, { status: 503 });
  }

  try {
    const sql = getAnalyticsSql();
    if (!sql) return NextResponse.json({ ok: false, configured: false }, { status: 503 });

    const probe = await sql.query(`
      SELECT
        current_database() AS database_name,
        to_regclass('public.analytics_sessions') IS NOT NULL AS sessions_table,
        to_regclass('public.analytics_events') IS NOT NULL AS events_table,
        (SELECT COUNT(*)::int FROM analytics_sessions) AS sessions,
        (SELECT COUNT(*)::int FROM analytics_events) AS events
    `);

    return NextResponse.json({ ok: true, configured: true, database: probe[0] || null });
  } catch (error) {
    console.error("analytics health failed", error);
    return NextResponse.json({ ok: false, configured: true, reachable: false }, { status: 500 });
  }
}
