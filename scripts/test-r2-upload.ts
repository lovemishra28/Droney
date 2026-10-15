import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const endpoint = process.env.R2_S3_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;

console.log("Testing R2 Connectivity with:", {
  endpoint,
  bucketName,
  publicDomain,
  hasKey: !!accessKeyId,
  hasSecret: !!secretAccessKey,
});

if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
  console.error("Missing R2 environment variables.");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function main() {
  const testKey = `test-uploads/altitude-verify-${Date.now()}.txt`;
  const content = "Cloudflare R2 storage connection successful for Altitude Drone Store!";

  console.log(`Uploading test object to key: ${testKey}...`);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      Body: content,
      ContentType: "text/plain",
    })
  );

  console.log("Upload SUCCESSFUL!");
  const publicUrl = `${publicDomain?.replace(/\/$/, "")}/${testKey}`;
  console.log(`Public Object URL: ${publicUrl}`);
}

main().catch((err) => {
  console.error("R2 Upload Failed:", err);
  process.exit(1);
});
