import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

function encodeObjectKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;

  return {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  }[file.type] || "bin";
}

export async function POST(req: Request) {
  const { userId } = await auth();
  const allowedUsers = (process.env.ADMIN_CLERK_USER_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!userId || !allowedUsers.includes(userId)) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const bucketName = process.env.R2_BUCKET_NAME;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const publicBaseUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL || "").replace(/\/$/, "");

  if (!accountId || !bucketName || !apiToken || !publicBaseUrl) {
    return NextResponse.json(
      { error: "Cloudflare R2 não configurado completamente." },
      { status: 503 },
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Envie um arquivo no campo file." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Formato não permitido. Use JPG, PNG, WEBP ou AVIF." },
      { status: 400 },
    );
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "O arquivo deve ter no máximo 10 MB." },
      { status: 400 },
    );
  }

  const requestedFolder = formData.get("folder");
  const folder =
    typeof requestedFolder === "string" && /^[a-z0-9/_-]{1,60}$/i.test(requestedFolder)
      ? requestedFolder.replace(/^\/+|\/+$/g, "")
      : "products";
  const objectKey = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extensionFor(file)}`;
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${encodeURIComponent(bucketName)}/objects/${encodeObjectKey(objectKey)}`;

  const uploadResponse = await fetch(endpoint, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": file.type,
    },
    body: await file.arrayBuffer(),
  });

  if (!uploadResponse.ok) {
    const details = await uploadResponse.text();
    console.error("R2 upload failed", uploadResponse.status, details);
    return NextResponse.json(
      { error: "Não foi possível enviar a imagem ao Cloudflare R2." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    key: objectKey,
    url: `${publicBaseUrl}/${objectKey}`,
  });
}
