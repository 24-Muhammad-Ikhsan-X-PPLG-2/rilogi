import { createClient } from "@supabase/supabase-js";

const CLOUD_URL = "https://cbrvwzqvysexfxqrceix.supabase.co";
const CLOUD_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNicnZ3enF2eXNleGZ4cXJjZWl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODExNDMzNywiZXhwIjoyMDczNjkwMzM3fQ.wrcLXDuCckdXJQlEBdsc94q5gcasy9solI4MplMaDvM";

const LOCAL_URL = "http://localhost:54321";
const LOCAL_KEY = "sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz";

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
      }
    );

    if (createError && !createError.message.includes("already exists")) {
      console.error(
        `❌ Gagal membuat bucket ${bucket.name}:`,
        createError.message
      );
    } else {
      console.log(`✅ Bucket ${bucket.name} berhasil dibuat`);
    }
  }

  console.log("🎉 Semua bucket berhasil disalin (tanpa file)");
}

cloneBuckets().catch(console.error);
