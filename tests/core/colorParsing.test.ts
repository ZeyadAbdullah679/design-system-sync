import { figmaColorToComposeHex, figmaColorToAndroidHex, figmaColorToHexString } from '../../src/utils/colors';
import { generateAndroidColorsXML, generateComposeColorsKotlin, generateIOSColorsSwift, generateFlutterColors, getColorModes } from '../../src/generators/colors';

describe('Color Parsing Tests', () => {
  const createMockColorVariable = (
    name: string,
    r: number,
    g: number,
    b: number,
    a: number = 1
  ) => ({
    id: `var_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description: '',
    type: 'COLOR',
    values: {
      'mode_default': { r: r / 255, g: g / 255, b: b / 255, a }
    }
  });

  describe('Color Conversion Functions', () => {
    test('should convert Figma color to Android hex correctly', () => {
      const color = { r: 0.38, g: 0, b: 0.93, a: 1 };
      const result = figmaColorToAndroidHex(color);

      expect(result).toBe('#FF6100ED');
    });

    test('should handle alpha channel in Android hex', () => {
      const color = { r: 1, g: 0, b: 0, a: 0.5 };
      const result = figmaColorToAndroidHex(color);

      expect(result).toMatch(/^#80FF0000$/);
    });

    test('should convert Figma color to Compose hex correctly', () => {
      const color = { r: 0.38, g: 0, b: 0.93, a: 1 };
      const result = figmaColorToComposeHex(color);

      expect(result).toBe('0xFF6100ED');
    });

    test('should convert Figma color to hex string (no alpha)', () => {
      const color = { r: 0.38, g: 0, b: 0.93, a: 1 };
      const result = figmaColorToHexString(color);

      expect(result).toBe('#6100ED');
    });

    test('should handle pure black color', () => {
      const black = { r: 0, g: 0, b: 0, a: 1 };
      expect(figmaColorToHexString(black)).toBe('#000000');
    });

    test('should handle pure white color', () => {
      const white = { r: 1, g: 1, b: 1, a: 1 };
      expect(figmaColorToHexString(white)).toBe('#FFFFFF');
    });

    test('should handle exact RGB values', () => {
      const purple = { r: 98 / 255, g: 0, b: 238 / 255, a: 1 };
      const result = figmaColorToHexString(purple);

      expect(result).toBe('#6200EE');
    });

    test('should handle edge case values (0.001, 0.999)', () => {
      const edgeColor = { r: 0.001, g: 0.999, b: 0.5, a: 1 };
      const result = figmaColorToHexString(edgeColor);

      expect(result).toMatch(/^#00FF(7F|80)$/);
    });
  });

  describe('Android Colors XML Generation', () => {
    test('should generate valid colors.xml', () => {
      const colorVars = [
        createMockColorVariable('primary', 98, 0, 238),
        createMockColorVariable('secondary', 3, 218, 198)
      ];

      const collection = {
        id: 'col_test',
        name: 'Brand Colors',
        modes: [{ name: 'Default', modeId: 'mode_default' }],
        variables: colorVars
      };

      const result = generateAndroidColorsXML([collection]);

      expect(result).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(result).toContain('<!-- Generated from Figma color variables -->');
      expect(result).toContain('<resources>');
      expect(result).toContain('<color name="primary">');
      expect(result).toContain('<color name="secondary">');
      expect(result).toContain('</resources>');
    });

    test('should sanitize color names for XML', () => {
      const colorVar = createMockColorVariable('primary-dark/hover', 55, 0, 179);

      const collection = {
        id: 'col_test',
        name: 'Test',
        modes: [{ name: 'Default', modeId: 'mode_default' }],
        variables: [colorVar]
      };

      const result = generateAndroidColorsXML([collection]);

      expect(result).toContain('primary_dark_hover');
      expect(result).not.toContain('primary-dark/hover');
    });
  });

  describe('Compose Colors Generation', () => {
    test('should generate valid Kotlin Color definitions', () => {
      const colorVars = [
        createMockColorVariable('primary', 98, 0, 238),
        createMockColorVariable('background', 255, 255, 255)
      ];

      const collection = {
        id: 'col_test',
        name: 'Colors',
        modes: [{ name: 'Default', modeId: 'mode_default' }],
        variables: colorVars
      };

      const result = generateComposeColorsKotlin([collection], 'com.example.theme');

      expect(result).toContain('package com.example.theme');
      expect(result).toContain('import androidx.compose.ui.graphics.Color');
      expect(result).toContain('Color(0xFF6200EE)');
      expect(result).toContain('Color(0xFFFFFFFF)');
    });
  });

  describe('iOS Colors Generation', () => {
    test('should generate SwiftUI Color extensions with hex initializer', () => {
      const colorVars = [
        createMockColorVariable('primary', 98, 0, 238)
      ];

      const collection = {
        id: 'col_test',
        name: 'Colors',
        modes: [{ name: 'Default', modeId: 'mode_default' }],
        variables: colorVars
      };

      const result = generateIOSColorsSwift([collection], true);

      expect(result).toContain('import SwiftUI');
      // Must include the hex initializer extension
      expect(result).toContain('init(hex: String, opacity: Double = 1.0)');
      expect(result).toContain('scanner.scanHexInt64(&rgbValue)');
      // Color definitions
      expect(result).toContain('static let primary = Color(hex: "#6200EE")');
    });

    test('should generate UIKit UIColor extensions with hex initializer', () => {
      const colorVars = [
        createMockColorVariable('primary', 98, 0, 238)
      ];

      const collection = {
        id: 'col_test',
        name: 'Colors',
        modes: [{ name: 'Default', modeId: 'mode_default' }],
        variables: colorVars
      };

      const result = generateIOSColorsSwift([collection], false);

      expect(result).toContain('import UIKit');
      expect(result).toContain('convenience init(hex: String, alpha: CGFloat = 1.0)');
      expect(result).toContain('extension UIColor {');
      expect(result).toContain('static let primary = UIColor(hex: "#6200EE")');
    });

    test('should include opacity parameter for colors with alpha < 1', () => {
      const colorVars = [
        createMockColorVariable('overlay', 0, 0, 0, 0.5)
      ];

      const collection = {
        id: 'col_test',
        name: 'Colors',
        modes: [{ name: 'Default', modeId: 'mode_default' }],
        variables: colorVars
      };

      const swiftUIResult = generateIOSColorsSwift([collection], true);
      expect(swiftUIResult).toContain('opacity: 0.5');

      const uiKitResult = generateIOSColorsSwift([collection], false);
      expect(uiKitResult).toContain('alpha: 0.5');
    });

    test('should not include opacity for fully opaque colors', () => {
      const colorVars = [
        createMockColorVariable('solid', 255, 0, 0, 1)
      ];

      const collection = {
        id: 'col_test',
        name: 'Colors',
        modes: [{ name: 'Default', modeId: 'mode_default' }],
        variables: colorVars
      };

      const result = generateIOSColorsSwift([collection], true);
      expect(result).toContain('static let solid = Color(hex: "#FF0000")');
      // The color definition itself should not have an opacity parameter
      expect(result).not.toContain('solid = Color(hex: "#FF0000", opacity');
    });
  });

  describe('Color Name Prefix Stripping', () => {
    test('should strip "Color/" prefix from variable names', () => {
      const colorVars = [
        createMockColorVariable('Color/Primary', 98, 0, 238)
      ];

      const collection = {
        id: 'col_test',
        name: 'Colors',
        modes: [{ name: 'Default', modeId: 'mode_default' }],
        variables: colorVars
      };

      const result = generateComposeColorsKotlin([collection]);
      expect(result).toContain('val Primary');
      // The variable name should not contain "Color" prefix
      expect(result).not.toContain('val Color');
    });

    test('should NOT strip "Color" from names like "Colorado"', () => {
      const colorVars = [
        createMockColorVariable('Colorado', 139, 90, 43)
      ];

      const collection = {
        id: 'col_test',
        name: 'Colors',
        modes: [{ name: 'Default', modeId: 'mode_default' }],
        variables: colorVars
      };

      const result = generateFlutterColors([collection]);
      expect(result).toContain('colorado');
    });
  });

  describe('Flutter Colors Generation', () => {
    test('should generate valid Dart Color class', () => {
      const colorVars = [
        createMockColorVariable('primary', 98, 0, 238),
        createMockColorVariable('secondary', 3, 218, 198)
      ];

      const collection = {
        id: 'col_test',
        name: 'Colors',
        modes: [{ name: 'Default', modeId: 'mode_default' }],
        variables: colorVars
      };

      const result = generateFlutterColors([collection]);

      expect(result).toContain('import \'package:flutter/material.dart\';');
      expect(result).toContain('class AppColors {');
      expect(result).toContain('static const Color primary = Color.fromARGB(255, 98, 0, 238);');
      expect(result).toContain('static const Color secondary = Color.fromARGB(255, 3, 218, 198);');
    });
  });

  describe('Multi-Mode Color Support (Theming)', () => {
    const createMultiModeCollection = () => ({
      id: 'col_theme',
      name: 'Theme Colors',
      modes: [
        { name: 'Light', modeId: 'mode_light' },
        { name: 'Dark', modeId: 'mode_dark' }
      ],
      variables: [
        {
          id: 'var_bg',
          name: 'background',
          description: '',
          values: {
            'mode_light': { r: 1, g: 1, b: 1, a: 1 },       // white
            'mode_dark': { r: 0, g: 0, b: 0, a: 1 }          // black
          }
        },
        {
          id: 'var_text',
          name: 'text',
          description: '',
          values: {
            'mode_light': { r: 0, g: 0, b: 0, a: 1 },       // black
            'mode_dark': { r: 1, g: 1, b: 1, a: 1 }          // white
          }
        }
      ]
    });

    test('getColorModes should return all modes from collections', () => {
      const collection = createMultiModeCollection();
      const modes = getColorModes([collection]);

      expect(modes).toHaveLength(2);
      expect(modes[0].name).toBe('Light');
      expect(modes[1].name).toBe('Dark');
    });

    test('should generate light mode colors when modeId is specified', () => {
      const collection = createMultiModeCollection();
      const result = generateAndroidColorsXML([collection], 'mode_light');

      expect(result).toContain('#FFFFFFFF'); // white background
      expect(result).toContain('#FF000000'); // black text
    });

    test('should generate dark mode colors when modeId is specified', () => {
      const collection = createMultiModeCollection();
      const result = generateAndroidColorsXML([collection], 'mode_dark');

      expect(result).toContain('#FF000000'); // black background
      expect(result).toContain('#FFFFFFFF'); // white text
    });

    test('should default to first mode when no modeId specified', () => {
      const collection = createMultiModeCollection();
      const resultDefault = generateAndroidColorsXML([collection]);
      const resultExplicit = generateAndroidColorsXML([collection], 'mode_light');

      expect(resultDefault).toBe(resultExplicit);
    });

    test('Compose generator should support modeId parameter', () => {
      const collection = createMultiModeCollection();

      const lightResult = generateComposeColorsKotlin([collection], null, 'mode_light');
      expect(lightResult).toContain('Color(0xFFFFFFFF)'); // white

      const darkResult = generateComposeColorsKotlin([collection], null, 'mode_dark');
      expect(darkResult).toContain('Color(0xFF000000)'); // black
    });

    test('iOS generator should support modeId parameter', () => {
      const collection = createMultiModeCollection();

      const lightResult = generateIOSColorsSwift([collection], true, 'mode_light');
      expect(lightResult).toContain('hex: "#FFFFFF"');

      const darkResult = generateIOSColorsSwift([collection], true, 'mode_dark');
      expect(darkResult).toContain('hex: "#000000"');
    });

    test('Flutter generator should support modeId parameter', () => {
      const collection = createMultiModeCollection();

      const lightResult = generateFlutterColors([collection], 'mode_light');
      expect(lightResult).toContain('Color.fromARGB(255, 255, 255, 255)');

      const darkResult = generateFlutterColors([collection], 'mode_dark');
      expect(darkResult).toContain('Color.fromARGB(255, 0, 0, 0)');
    });
  });
});
