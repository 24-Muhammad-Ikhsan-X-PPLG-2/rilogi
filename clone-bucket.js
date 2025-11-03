import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const CLOUD_URL = process.env.SUPABASE_CLOUD_URL;
const CLOUD_KEY = process.env.SUPABASE_CLOUD_KEY;

const LOCAL_URL = process.env.SUPABASE_LOCAL_URL;
const LOCAL_KEY = process.env.SUPABASE_LOCAL_KEY;

const cloud = createClient(CLOUD_URL, CLOUD_KEY);
const local = createClient(LOCAL_URL, LOCAL_KEY);

async function cloneBuckets() {
  const { data: buckets, error } = await cloud.storage.listBuckets();
  if (error) throw error;

  for (const bucket of buckets) {
    console.log(`🪣 Membuat bucket: ${bucket.name}`);

    const { error: createError } = await local.storage.createBucket(
      bucket.name,
      {
        public: bucket.public,
        fileSizeLimit: bucket.file_size_limit,
        allowedMimeTypes: bucket.allowed_mime_types,
      },
    );

    if (createError && !createError.message.includes("already exists")) {
      console.error(
        `❌ Gagal membuat bucket ${bucket.name}:`,
        createError.message,
      );
    } else {
      console.log(`✅ Bucket ${bucket.name} berhasil dibuat`);
    }
  }

  console.log("🎉 Semua bucket berhasil disalin (tanpa file)");
}

cloneBuckets().catch(console.error);
