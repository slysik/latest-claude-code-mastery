export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidShortCode(code: string): boolean {
  if (code.length < 4 || code.length > 10) {
    return false;
  }
  return /^[a-zA-Z0-9]+$/.test(code);
}
