import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));

export function previewAnnotations(entry: string[] = []) {
  return [...entry, join(dir, 'preview.js')];
}
