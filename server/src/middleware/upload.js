import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { config } from '../config/env.js';
import { HttpError } from '../utils/http.js';
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUpload, files: 1, fields: 8, fieldSize: 10000 },
}).single('image');
const allowed = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};
export async function storeImage(file) {
  if (!file) return null;
  const type = await fileTypeFromBuffer(file.buffer);
  if (
    !type ||
    type.mime !== file.mimetype ||
    !allowed[type.mime]?.includes(path.extname(file.originalname).toLowerCase())
  )
    throw new HttpError(400, 'Choose a valid JPEG, PNG or WebP image.');
  let buffer;
  try {
    buffer = await sharp(file.buffer, {
      limitInputPixels: 40000000,
      animated: false,
    })
      .rotate()
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    throw new HttpError(400, 'The image is damaged or too large to decode.');
  }
  await mkdir(config.uploads, { recursive: true });
  const key = `${randomUUID()}.webp`;
  await writeFile(path.join(config.uploads, key), buffer, { flag: 'wx' });
  return key;
}
export async function removeImage(key) {
  if (key) await unlink(path.join(config.uploads, key)).catch(() => {});
}
