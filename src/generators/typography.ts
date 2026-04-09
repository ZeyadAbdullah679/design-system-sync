import { TypographyStyle } from '../types';

// Font weight mapping helpers

export function mapFontWeightToAndroid(weight: number): number {
  if (weight <= 100) return 100;
  if (weight <= 200) return 200;
  if (weight <= 300) return 300;
  if (weight <= 400) return 400;
  if (weight <= 500) return 500;
  if (weight <= 600) return 600;
  if (weight <= 700) return 700;
  if (weight <= 800) return 800;
  return 900;
}

export function mapFontWeightToSwiftUI(weight: number): string {
  if (weight <= 100) return 'ultraLight';
  if (weight <= 200) return 'thin';
  if (weight <= 300) return 'light';
  if (weight <= 400) return 'regular';
  if (weight <= 500) return 'medium';
  if (weight <= 600) return 'semibold';
  if (weight <= 700) return 'bold';
  if (weight <= 800) return 'heavy';
  return 'black';
}

export function mapFontWeightToUIKit(weight: number): string {
  if (weight <= 100) return 'ultraLight';
  if (weight <= 200) return 'thin';
  if (weight <= 300) return 'light';
  if (weight <= 400) return 'regular';
  if (weight <= 500) return 'medium';
  if (weight <= 600) return 'semibold';
  if (weight <= 700) return 'bold';
  if (weight <= 800) return 'heavy';
  return 'black';
}

export function mapFontWeightToFlutter(weight: number): string {
  if (weight <= 100) return 'w100';
  if (weight <= 200) return 'w200';
  if (weight <= 300) return 'w300';
  if (weight <= 400) return 'w400';
  if (weight <= 500) return 'w500';
  if (weight <= 600) return 'w600';
  if (weight <= 700) return 'w700';
  if (weight <= 800) return 'w800';
  return 'w900';
}

// System fonts that don't need external resources
const SYSTEM_FONTS: { [key: string]: string } = {
  'Roboto': 'FontFamily.Default',
  'Sans Serif': 'FontFamily.SansSerif',
  'SansSerif': 'FontFamily.SansSerif',
  'Serif': 'FontFamily.Serif',
  'Monospace': 'FontFamily.Monospace',
  'Cursive': 'FontFamily.Cursive'
};

export function generateAndroidTypography(styles: TypographyStyle[], packageName: string | null): string {
  const lines: string[] = [];

  if (packageName) {
    lines.push(`package ${packageName}`, '');
  }

  lines.push('import androidx.compose.ui.text.TextStyle');
  lines.push('import androidx.compose.ui.text.font.FontFamily');
  lines.push('import androidx.compose.ui.text.font.FontWeight');
  lines.push('import androidx.compose.ui.unit.sp');
  lines.push('');
  lines.push('// Generated from Figma text styles');
  lines.push('');

  // Collect unique custom font families (not system fonts)
  const customFontFamilies = new Set<string>();
  styles.forEach(style => {
    if (style.fontFamily && !SYSTEM_FONTS[style.fontFamily]) {
      customFontFamilies.add(style.fontFamily);
    }
  });

  // Generate FontFamily definitions for custom fonts only
  if (customFontFamilies.size > 0) {
    lines.push('// Custom Font Family Definitions');
    lines.push('// TODO: Add font files to res/font/ directory and define FontFamily objects');
    lines.push('// Example:');
    lines.push('// val InterFontFamily = FontFamily(');
    lines.push('//     Font(R.font.inter_regular, FontWeight.Normal),');
    lines.push('//     Font(R.font.inter_medium, FontWeight.Medium),');
    lines.push('//     Font(R.font.inter_bold, FontWeight.Bold)');
    lines.push('// )');
    lines.push('');

    customFontFamilies.forEach(fontFamily => {
      const safeFontName = fontFamily.replace(/\s+/g, '');
      lines.push(`// TODO: Define ${safeFontName}FontFamily with actual font resources`);
      lines.push(`val ${safeFontName}FontFamily = FontFamily.Default // Replace with custom font`);
    });

    lines.push('');
    lines.push('// Typography Styles');
    lines.push('');
  }

  // Generate TextStyles
  styles.forEach(style => {
    // Remove "Font" or "Typography" prefix if present
    let cleanName = style.name.replace(/^(font|typography)[\/\s-_]+/i, '');

    const safeName = cleanName
      .split(/[^a-zA-Z0-9]+/)
      .filter(part => part.length > 0)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');

    lines.push(`val ${safeName} = TextStyle(`);

    // Determine which FontFamily to use
    if (style.fontFamily) {
      if (SYSTEM_FONTS[style.fontFamily]) {
        lines.push(`    fontFamily = ${SYSTEM_FONTS[style.fontFamily]},`);
      } else {
        const safeFontName = style.fontFamily.replace(/\s+/g, '');
        lines.push(`    fontFamily = ${safeFontName}FontFamily,`);
      }
    }

    lines.push(`    fontSize = ${Math.round(style.fontSize)}.sp,`);
    lines.push(`    fontWeight = FontWeight(${style.fontWeight}),`);

    if (style.letterSpacing !== 0) {
      const letterSpacing = Math.round(style.letterSpacing * 100) / 100;
      lines.push(`    letterSpacing = ${letterSpacing}.sp,`);
    }

    const lineHeight = Math.round(style.lineHeight * 10) / 10;
    lines.push(`    lineHeight = ${lineHeight}.sp`);

    lines.push(')');
    lines.push('');
  });

  return lines.join('\n');
}

export function generateAndroidTypographyXML(styles: TypographyStyle[]): string {
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<!-- Generated from Figma text styles -->\n';
  xml += '<resources>\n';

  styles.forEach(style => {
    // Remove "Font" or "Typography" prefix if present
    let cleanName = style.name.replace(/^(font|typography)[\/\s-_]+/i, '');

    const safeName = cleanName
      .split(/[^a-zA-Z0-9]+/)
      .filter(part => part.length > 0)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');

    xml += `\n    <!-- ${style.name} -->\n`;
    xml += `    <style name="TextAppearance.${safeName}">\n`;

    // Include fontFamily for custom fonts
    if (style.fontFamily) {
      xml += `        <item name="android:fontFamily">${style.fontFamily}</item>\n`;
    }

    xml += `        <item name="android:textSize">${Math.round(style.fontSize)}sp</item>\n`;

    const androidFontWeight = mapFontWeightToAndroid(style.fontWeight);
    if (androidFontWeight !== 400) {
      xml += `        <item name="android:textFontWeight">${androidFontWeight}</item>\n`;
    }

    if (style.letterSpacing !== 0) {
      const letterSpacingEm = (style.letterSpacing / style.fontSize).toFixed(4);
      xml += `        <item name="android:letterSpacing">${letterSpacingEm}</item>\n`;
    }

    const lineHeightSp = Math.round(style.lineHeight);
    xml += `        <item name="android:lineHeight">${lineHeightSp}sp</item>\n`;

    xml += `    </style>\n`;
  });

  xml += '</resources>';
  return xml;
}

export function generateIOSTypography(styles: TypographyStyle[], useSwiftUI: boolean): string {
  const lines: string[] = [];

  lines.push('// Generated from Figma text styles');
  lines.push(useSwiftUI ? 'import SwiftUI' : 'import UIKit');
  lines.push('');
  lines.push('// MARK: - Typography Styles');
  lines.push(useSwiftUI ? 'extension Font {' : 'extension UIFont {');

  // iOS system font families that don't need Font.custom()
  const iosSystemFonts = ['SF Pro', 'San Francisco', '.SF UI', 'SF Pro Display', 'SF Pro Text', 'SF Pro Rounded', 'New York'];

  styles.forEach(style => {
    // Remove "Font" or "Typography" prefix
    let cleanName = style.name.replace(/^(font|typography)[\/\s-_]+/i, '');

    const parts = cleanName.split(/[^a-zA-Z0-9]+/).filter(p => p.length > 0);

    // First part lowercase, rest preserve casing with first letter uppercase
    const safeName = parts.length > 0
      ? parts[0].toLowerCase() + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')
      : 'unnamed';

    const fontSize = Math.round(style.fontSize);
    const isSystemFont = !style.fontFamily || iosSystemFonts.includes(style.fontFamily);

    if (useSwiftUI) {
      const swiftUIWeight = mapFontWeightToSwiftUI(style.fontWeight);

      if (isSystemFont) {
        lines.push(`    static let ${safeName} = Font.system(size: ${fontSize}, weight: .${swiftUIWeight})`);
      } else {
        // Preserve exact font family name for Font.custom()
        lines.push(`    static let ${safeName} = Font.custom("${style.fontFamily}", size: ${fontSize}).weight(.${swiftUIWeight})`);
      }
    } else {
      const uiKitWeight = mapFontWeightToUIKit(style.fontWeight);

      if (isSystemFont) {
        lines.push(`    static let ${safeName} = UIFont.systemFont(ofSize: ${fontSize}, weight: .${uiKitWeight})`);
      } else {
        // Use UIFont(name:size:) for custom fonts, with systemFont fallback
        lines.push(`    static let ${safeName} = UIFont(name: "${style.fontFamily}", size: ${fontSize}) ?? UIFont.systemFont(ofSize: ${fontSize}, weight: .${uiKitWeight})`);
      }
    }
  });

  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

export function generateFlutterTypography(styles: TypographyStyle[]): string {
  const lines: string[] = [];

  lines.push('// Generated from Figma text styles');
  lines.push('import \'package:flutter/material.dart\';');
  lines.push('');
  lines.push('class AppTextStyles {');

  styles.forEach(style => {
    let cleanName = style.name.replace(/^(font|typography)[\/\s-_]+/i, '');

    const parts = cleanName.split(/[^a-zA-Z0-9]+/).filter(p => p.length > 0);

    // First part lowercase, rest preserve casing with first letter uppercase
    const safeName = parts.length > 0
      ? parts[0].toLowerCase() + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')
      : 'unnamed';

    const flutterWeight = mapFontWeightToFlutter(style.fontWeight);
    const fontSize = Math.round(style.fontSize);
    const lineHeight = Math.round(style.lineHeight * 10) / 10;

    lines.push(`  static const TextStyle ${safeName} = TextStyle(`);

    if (style.fontFamily && style.fontFamily !== 'Roboto') {
      lines.push(`    fontFamily: '${style.fontFamily}',`);
    }

    lines.push(`    fontSize: ${fontSize},`);
    lines.push(`    fontWeight: FontWeight.${flutterWeight},`);

    if (style.letterSpacing !== 0) {
      const letterSpacing = Math.round(style.letterSpacing * 100) / 100;
      lines.push(`    letterSpacing: ${letterSpacing},`);
    }

    const heightRatio = Math.round((lineHeight / fontSize) * 100) / 100;
    lines.push(`    height: ${heightRatio},`);

    lines.push(`  );`);
    lines.push('');
  });

  lines.push('}');
  lines.push('');
  return lines.join('\n');
}
