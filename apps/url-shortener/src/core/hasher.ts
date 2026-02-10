import { createHash } from "node:crypto";

const BASE62_CHARS =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function toBase62(buffer: Buffer): string {
  let result = "";
  let num = BigInt("0x" + buffer.toString("hex"));
  while (num > 0n) {
    result = BASE62_CHARS[Number(num % 62n)] + result;
    num = num / 62n;
  }
  return result || "0";
}

export function generateShortCode(url: string, length: number = 6): string {
  const hash = createHash("sha256").update(url).digest();
  const base62 = toBase62(hash);
  return base62.slice(0, length);
}

export function generateShortCodeWithCollisionCheck(
  url: string,
  existingCodes: string[],
  length: number = 6
): string {
  const codeSet = new Set(existingCodes);
  let candidate = generateShortCode(url, length);

  if (!codeSet.has(candidate)) {
    return candidate;
  }

  let suffix = 1;
  while (codeSet.has(candidate)) {
    candidate = generateShortCode(`${url}${suffix}`, length);
    suffix++;
  }

  return candidate;
}
