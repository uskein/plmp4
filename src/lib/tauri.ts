import { convertFileSrc } from "@tauri-apps/api/core";

/**
 * Convert a native file path to an asset protocol URL for Tauri.
 * This allows the <video> tag to play local files securely.
 */
export function assetUrl(filePath: string): string {
  return convertFileSrc(filePath);
}

/**
 * Debounce utility
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
