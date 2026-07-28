export function generatePersistentSeed(cryptoSource = globalThis.crypto) {
  if (
    !cryptoSource ||
    typeof cryptoSource.getRandomValues !== "function"
  ) {
    throw new Error(
      "Web Crypto getRandomValues is required to create a save seed"
    );
  }
  const bytes = new Uint8Array(16);
  cryptoSource.getRandomValues(bytes);
  return [...bytes]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
