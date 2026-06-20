/** True when VITE_CONVEX_URL is set and ConvexProvider is active. */
export function isConvexEnabled(): boolean {
  return !!import.meta.env.VITE_CONVEX_URL;
}

/** Local-only account ids start with local_ */
export function isCloudAccount(accountId: string | null): boolean {
  return !!accountId && !accountId.startsWith("local_");
}

/** Local-only character ids start with char_ */
export function isCloudCharacter(characterId: string | null): boolean {
  return !!characterId && !characterId.startsWith("char_");
}
