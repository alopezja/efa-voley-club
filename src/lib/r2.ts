import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { serverEnv } from "@/lib/env";
import { slugify } from "@/lib/slug";

export function buildObjectKey(folder: string, filename: string): string {
  const dot = filename.lastIndexOf(".");
  const ext = dot >= 0 ? filename.slice(dot).toLowerCase() : "";
  const base = slugify(dot >= 0 ? filename.slice(0, dot) : filename) || "archivo";
  return `${folder}/${Date.now()}-${base}${ext}`;
}

export function publicUrlForKey(key: string, base: string): string {
  return `${base.replace(/\/$/, "")}/${key}`;
}

function r2Client() {
  const env = serverEnv();
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function createPresignedUpload(folder: string, filename: string, contentType: string) {
  const env = serverEnv();
  const key = buildObjectKey(folder, filename);
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(r2Client(), command, { expiresIn: 600 });
  return { uploadUrl, key, publicUrl: publicUrlForKey(key, env.R2_PUBLIC_BASE_URL) };
}
