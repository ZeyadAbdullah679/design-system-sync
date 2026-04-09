// Convert Figma color (0..1 RGBA) to ARGB hex for Android Compose (0xAARRGGBB)
export function figmaColorToComposeHex(color: { r: number; g: number; b: number; a: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.round(color.a * 255);
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  return `0x${toHex(a)}${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert Figma color (0..1 RGBA) to #AARRGGBB hex for Android XML
export function figmaColorToAndroidHex(color: { r: number; g: number; b: number; a: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.round(color.a * 255);
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(a)}${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Simple hex for iOS/Flutter (UIColor/SwiftUI/Flutter Color initializer via hex string)
export function figmaColorToHexString(color: { r: number; g: number; b: number; a: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
