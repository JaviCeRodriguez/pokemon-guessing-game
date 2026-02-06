import "server-only";

import { createDecipheriv, createCipheriv, randomBytes, scryptSync } from "node:crypto";

declare global {
  // eslint-disable-next-line no-var
  var __pokemonHangmanDevSecret: string | undefined;
}

function getKey(): Buffer {
  let secret = process.env.POKEMON_GAME_SECRET;
  if (!secret && process.env.NODE_ENV !== "production") {
    if (!globalThis.__pokemonHangmanDevSecret) {
      globalThis.__pokemonHangmanDevSecret = randomBytes(32).toString("hex");
    }
    secret = globalThis.__pokemonHangmanDevSecret;
  }

  if (!secret) {
    throw new Error("Missing POKEMON_GAME_SECRET in production environment.");
  }
  // Derive a stable 32-byte key from the secret.
  return scryptSync(secret, "pokemon-hangman-salt-v1", 32);
}

export function encryptGameToken(payload: unknown): string {
  const key = getKey();
  const iv = randomBytes(12); // recommended length for GCM
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  // token = base64url(iv || tag || ciphertext)
  const packed = Buffer.concat([iv, tag, ciphertext]);
  return packed.toString("base64url");
}

export function decryptGameToken<T>(token: string): T {
  const key = getKey();
  const packed = Buffer.from(token, "base64url");

  if (packed.length < 12 + 16 + 1) {
    throw new Error("Invalid game token");
  }

  const iv = packed.subarray(0, 12);
  const tag = packed.subarray(12, 28);
  const ciphertext = packed.subarray(28);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}

