import { ColorCollectionExport } from '../types';
import { figmaColorToAndroidHex, figmaColorToComposeHex, figmaColorToHexString } from '../utils/colors';

// Helper: resolve modeId — use provided or fall back to first mode
function resolveModeId(collection: ColorCollectionExport, modeId?: string): string | undefined {
  if (modeId) return modeId;
  return collection.modes[0]?.modeId;
}

// Helper: clean "Color" prefix from variable names
function cleanColorName(name: string): string {
  return name.replace(/^color[\/\s-_]+/i, '');
}

// Helper: convert name to camelCase (first part lowercase)
function toCamelCase(name: string): string {
  const parts = name.split(/[^a-zA-Z0-9]+/).filter(p => p.length > 0);
  return parts.length > 0
    ? parts[0].toLowerCase() + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')
    : 'unnamed';
}

// Helper: convert name to PascalCase
function toPascalCase(name: string): string {
  const parts = name.split(/[^a-zA-Z0-9]+/).filter(part => part.length > 0);
  return parts.length > 0
    ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase() +
      parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')
    : 'Unnamed';
}

export function generateAndroidColorsXML(colorCollections: ColorCollectionExport[], modeId?: string): string {
  const colorMap: { [name: string]: string } = {};

  colorCollections.forEach(collection => {
    const targetModeId = resolveModeId(collection, modeId);

    collection.variables.forEach(variable => {
      const colorVal = targetModeId ? variable.values[targetModeId] : undefined;
      if (!colorVal) return;

      const androidHex = figmaColorToAndroidHex(colorVal);
      const safeName = variable.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      colorMap[safeName] = androidHex;
    });
  });

  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<!-- Generated from Figma color variables -->\n';
  xml += '<resources>\n';

  Object.entries(colorMap).forEach(([name, hex]) => {
    xml += `    <color name="${name}">${hex}</color>\n`;
  });

  xml += '</resources>';
  return xml;
}

export function generateComposeColorsKotlin(colorCollections: ColorCollectionExport[], packageName: string | null = null, modeId?: string): string {
  const lines: string[] = [];

  if (packageName) {
    lines.push(`package ${packageName}`, '');
  }

  lines.push(
    'import androidx.compose.ui.graphics.Color',
    '',
    '// Generated from Figma color variables',
    ''
  );

  const colorDefs: { [name: string]: string } = {};

  colorCollections.forEach(collection => {
    const targetModeId = resolveModeId(collection, modeId);

    collection.variables.forEach(variable => {
      const colorVal = targetModeId ? variable.values[targetModeId] : undefined;
      if (!colorVal) return;

      const composeHex = figmaColorToComposeHex(colorVal);
      const safeName = toPascalCase(cleanColorName(variable.name));
      colorDefs[safeName] = composeHex;
    });
  });

  Object.entries(colorDefs).forEach(([name, hex]) => {
    lines.push(`val ${name} = Color(${hex})`);
  });

  lines.push('');
  return lines.join('\n');
}

export function generateIOSColorsSwift(colorCollections: ColorCollectionExport[], useSwiftUI: boolean, modeId?: string): string {
  const lines: string[] = [];

  lines.push('// Generated from Figma color variables');
  lines.push(useSwiftUI ? 'import SwiftUI' : 'import UIKit');
  lines.push('');

  // Generate the hex initializer extension that iOS doesn't provide natively
  if (useSwiftUI) {
    lines.push('// MARK: - Color Hex Initializer');
    lines.push('extension Color {');
    lines.push('    init(hex: String, opacity: Double = 1.0) {');
    lines.push('        let hex = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))');
    lines.push('        let scanner = Scanner(string: hex)');
    lines.push('        var rgbValue: UInt64 = 0');
    lines.push('        scanner.scanHexInt64(&rgbValue)');
    lines.push('        self.init(');
    lines.push('            red: Double((rgbValue >> 16) & 0xFF) / 255.0,');
    lines.push('            green: Double((rgbValue >> 8) & 0xFF) / 255.0,');
    lines.push('            blue: Double(rgbValue & 0xFF) / 255.0,');
    lines.push('            opacity: opacity');
    lines.push('        )');
    lines.push('    }');
    lines.push('}');
  } else {
    lines.push('// MARK: - UIColor Hex Initializer');
    lines.push('extension UIColor {');
    lines.push('    convenience init(hex: String, alpha: CGFloat = 1.0) {');
    lines.push('        let hex = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))');
    lines.push('        let scanner = Scanner(string: hex)');
    lines.push('        var rgbValue: UInt64 = 0');
    lines.push('        scanner.scanHexInt64(&rgbValue)');
    lines.push('        self.init(');
    lines.push('            red: CGFloat((rgbValue >> 16) & 0xFF) / 255.0,');
    lines.push('            green: CGFloat((rgbValue >> 8) & 0xFF) / 255.0,');
    lines.push('            blue: CGFloat(rgbValue & 0xFF) / 255.0,');
    lines.push('            alpha: alpha');
    lines.push('        )');
    lines.push('    }');
    lines.push('}');
  }

  lines.push('');
  lines.push('// MARK: - Design System Colors');
  lines.push(useSwiftUI ? 'extension Color {' : 'extension UIColor {');

  const baseIndent = '    ';

  colorCollections.forEach(collection => {
    const targetModeId = resolveModeId(collection, modeId);

    collection.variables.forEach(variable => {
      const colorVal = targetModeId ? variable.values[targetModeId] : undefined;
      if (!colorVal) return;

      const hex = figmaColorToHexString(colorVal);
      const safeName = toCamelCase(cleanColorName(variable.name));

      const colorType = useSwiftUI ? 'Color' : 'UIColor';
      const hasAlpha = colorVal.a < 1;
      if (hasAlpha) {
        const alpha = Math.round(colorVal.a * 100) / 100;
        const alphaParam = useSwiftUI ? 'opacity' : 'alpha';
        lines.push(`${baseIndent}static let ${safeName} = ${colorType}(hex: "${hex}", ${alphaParam}: ${alpha})`);
      } else {
        lines.push(`${baseIndent}static let ${safeName} = ${colorType}(hex: "${hex}")`);
      }
    });
  });

  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

export function generateFlutterColors(colorCollections: ColorCollectionExport[], modeId?: string): string {
  const lines: string[] = [];

  lines.push('// Generated from Figma color variables');
  lines.push('import \'package:flutter/material.dart\';');
  lines.push('');
  lines.push('class AppColors {');

  colorCollections.forEach(collection => {
    const targetModeId = resolveModeId(collection, modeId);

    collection.variables.forEach(variable => {
      const colorVal = targetModeId ? variable.values[targetModeId] : undefined;
      if (!colorVal) return;

      const r = Math.round(colorVal.r * 255);
      const g = Math.round(colorVal.g * 255);
      const b = Math.round(colorVal.b * 255);
      const a = Math.round(colorVal.a * 255);

      const safeName = toCamelCase(cleanColorName(variable.name));
      lines.push(`  static const Color ${safeName} = Color.fromARGB(${a}, ${r}, ${g}, ${b});`);
    });
  });

  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

/**
 * Get all unique modes across color collections.
 * Returns array of { name, modeId } objects.
 * If all collections have a single mode, returns just that one.
 */
export function getColorModes(colorCollections: ColorCollectionExport[]): { name: string; modeId: string }[] {
  const modeMap = new Map<string, string>();

  colorCollections.forEach(collection => {
    collection.modes.forEach(mode => {
      if (!modeMap.has(mode.modeId)) {
        modeMap.set(mode.modeId, mode.name);
      }
    });
  });

  return Array.from(modeMap.entries()).map(([modeId, name]) => ({ name, modeId }));
}
