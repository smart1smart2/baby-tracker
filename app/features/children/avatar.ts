import * as FileSystem from 'expo-file-system/legacy';

import { supabase } from '@/lib/supabase';

const BUCKET = 'child-avatars';

/**
 * Uploads an image file (URI from expo-image-picker) into the child-avatars
 * bucket and returns the public URL. Re-uses the same path per child so each
 * new upload overwrites the previous file.
 *
 * RN's `fetch(file://…)` is unreliable for binary uploads, so we read the
 * file as base64 via expo-file-system and hand a Uint8Array to Supabase.
 */
export async function uploadChildAvatar(
  childId: string,
  fileUri: string,
  mimeType: string,
): Promise<string> {
  const extension =
    mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const path = `${childId}/avatar.${extension}`;

  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const bytes = base64ToUint8Array(base64);

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: mimeType,
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // Bust caches when the same path is overwritten with a new image.
  return `${data.publicUrl}?v=${Date.now()}`;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = globalThis.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
