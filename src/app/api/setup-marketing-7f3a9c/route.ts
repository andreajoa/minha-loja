import { GET as runSetup } from "../_setup-marketing-7f3a9c/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return runSetup(req);
}
