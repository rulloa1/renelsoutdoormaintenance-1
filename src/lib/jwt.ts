const encoder = new TextEncoder();

function toBase64Url(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): string {
  const padded = str + "===".slice((str.length + 3) % 4);
  return atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
}

function arrayToBase64Url(buffer: ArrayBuffer): string {
  return btoa(
    String.fromCharCode(...new Uint8Array(buffer))
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToArray(str: string): Uint8Array<ArrayBuffer> {
  const padded = str + "===".slice((str.length + 3) % 4);
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const buf = new ArrayBuffer(binary.length);
  const arr = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i);
  }
  return arr;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signJWT(
  payload: Record<string, unknown>,
  secret: string
): Promise<string> {
  const key = await importKey(secret);
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = toBase64Url(
    JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) })
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${header}.${body}`)
  );
  return `${header}.${body}.${arrayToBase64Url(sig)}`;
}

export async function verifyJWT(
  token: string,
  secret: string
): Promise<Record<string, unknown>> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");
  const [header, body, sig] = parts as [string, string, string];
  const key = await importKey(secret);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToArray(sig),
    encoder.encode(`${header}.${body}`)
  );
  if (!valid) throw new Error("Invalid JWT signature");
  return JSON.parse(fromBase64Url(body)) as Record<string, unknown>;
}
