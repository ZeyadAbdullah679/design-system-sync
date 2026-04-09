import { TypographyStyle } from '../../src/types';
import {
  mapFontWeightToSwiftUI,
  mapFontWeightToFlutter,
  generateAndroidTypography,
  generateAndroidTypographyXML,
  generateIOSTypography,
  generateFlutterTypography
} from '../../src/generators/typography';

describe('Typography Parsing Tests', () => {
  const createMockTextStyle = (
    name: string,
    fontSize: number,
    fontWeight: string = 'Regular'
  ): TypographyStyle => {
    const fontWeightMap: { [key: string]: number } = {
      'Thin': 100,
      'Light': 300,
      'Regular': 400,
      'Medium': 500,
      'SemiBold': 600,
      'Bold': 700,
      'Black': 900
    };

    return {
      name,
      fontFamily: 'Inter',
      fontSize,
      fontWeight: fontWeightMap[fontWeight] || 400,
      letterSpacing: 0,
      lineHeight: fontSize * 1.2
    };
  };

  const mockStyles = [
    createMockTextStyle('Headline Large', 32, 'Bold'),
    createMockTextStyle('Body Medium', 14, 'Regular'),
    createMockTextStyle('Caption', 10, 'Light')
  ];

  describe('Android Compose Typography', () => {
    test('should generate valid Kotlin TextStyle definitions', () => {
      const result = generateAndroidTypography(mockStyles, 'com.example.theme');

      expect(result).toContain('package com.example.theme');
      expect(result).toContain('import androidx.compose.ui.text.TextStyle');
      expect(result).toContain('val HeadlineLarge = TextStyle(');
      expect(result).toContain('fontSize = 32.sp');
      expect(result).toContain('fontWeight = FontWeight(700)');
    });

    test('should work without package name', () => {
      const result = generateAndroidTypography(mockStyles, null);

      expect(result).not.toContain('package');
      expect(result).toContain('val HeadlineLarge');
    });
  });

  describe('iOS Typography', () => {
    test('should generate SwiftUI Font extensions with custom font names preserved', () => {
      const result = generateIOSTypography(mockStyles, true);

      expect(result).toContain('import SwiftUI');
      expect(result).toContain('extension Font {');
      expect(result).toContain('static let headlineLarge');
      expect(result).toContain('.weight(.bold)');
      // Custom font (Inter) should use Font.custom with exact name
      expect(result).toContain('Font.custom("Inter"');
    });

    test('should use Font.system for system fonts', () => {
      const systemFontStyles: TypographyStyle[] = [
        { name: 'Title', fontFamily: 'SF Pro', fontSize: 20, fontWeight: 700, letterSpacing: 0, lineHeight: 24 }
      ];

      const result = generateIOSTypography(systemFontStyles, true);
      expect(result).toContain('Font.system(size: 20, weight: .bold)');
      expect(result).not.toContain('Font.custom');
    });

    test('should preserve spaces in custom font family names', () => {
      const customFontStyles: TypographyStyle[] = [
        { name: 'Body', fontFamily: 'Helvetica Neue', fontSize: 16, fontWeight: 400, letterSpacing: 0, lineHeight: 20 }
      ];

      const result = generateIOSTypography(customFontStyles, true);
      expect(result).toContain('Font.custom("Helvetica Neue"');
    });

    test('should generate UIKit UIFont extensions', () => {
      const result = generateIOSTypography(mockStyles, false);

      expect(result).toContain('import UIKit');
      expect(result).toContain('extension UIFont {');
    });

    test('should use UIFont(name:size:) for custom fonts in UIKit with fallback', () => {
      const customFontStyles: TypographyStyle[] = [
        { name: 'Body', fontFamily: 'Avenir Next', fontSize: 16, fontWeight: 400, letterSpacing: 0, lineHeight: 20 }
      ];

      const result = generateIOSTypography(customFontStyles, false);
      expect(result).toContain('UIFont(name: "Avenir Next", size: 16)');
      expect(result).toContain('?? UIFont.systemFont');
    });

    test('should use UIFont.systemFont for system fonts in UIKit', () => {
      const systemFontStyles: TypographyStyle[] = [
        { name: 'Title', fontFamily: 'SF Pro', fontSize: 20, fontWeight: 700, letterSpacing: 0, lineHeight: 24 }
      ];

      const result = generateIOSTypography(systemFontStyles, false);
      expect(result).toContain('UIFont.systemFont(ofSize: 20, weight: .bold)');
      expect(result).not.toContain('UIFont(name:');
    });
  });

  describe('Flutter Typography', () => {
    test('should generate valid Dart TextStyle class', () => {
      const result = generateFlutterTypography(mockStyles);

      expect(result).toContain('import \'package:flutter/material.dart\';');
      expect(result).toContain('class AppTextStyles {');
      expect(result).toContain('static const TextStyle headlineLarge = TextStyle(');
    });
  });

  describe('Android XML Typography', () => {
    test('should generate valid XML styles with fontFamily', () => {
      const result = generateAndroidTypographyXML(mockStyles);

      expect(result).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(result).toContain('<resources>');
      expect(result).toContain('<style name="TextAppearance.HeadlineLarge">');
      expect(result).toContain('<item name="android:fontFamily">Inter</item>');
      expect(result).toContain('<item name="android:textSize">32sp</item>');
      expect(result).toContain('<item name="android:textFontWeight">700</item>');
    });

    test('should not include textFontWeight for regular (400) weight', () => {
      const regularStyles: TypographyStyle[] = [
        { name: 'Body', fontFamily: 'Roboto', fontSize: 14, fontWeight: 400, letterSpacing: 0, lineHeight: 20 }
      ];

      const result = generateAndroidTypographyXML(regularStyles);
      expect(result).not.toContain('textFontWeight');
    });

    test('should convert letterSpacing to em units', () => {
      const stylesWithLetterSpacing: TypographyStyle[] = [
        { name: 'Spaced', fontFamily: 'Roboto', fontSize: 16, fontWeight: 400, letterSpacing: 0.5, lineHeight: 20 }
      ];

      const result = generateAndroidTypographyXML(stylesWithLetterSpacing);
      // 0.5 / 16 = 0.03125
      expect(result).toContain('android:letterSpacing');
      expect(result).toContain('0.0313');
    });
  });

  describe('Style Name Prefix Stripping', () => {
    test('should strip "Font/" prefix from style names', () => {
      const styles: TypographyStyle[] = [
        { name: 'Font/Headline', fontFamily: 'Roboto', fontSize: 24, fontWeight: 700, letterSpacing: 0, lineHeight: 28 }
      ];

      const result = generateAndroidTypography(styles, null);
      expect(result).toContain('val Headline');
      expect(result).not.toMatch(/val Font/);
    });

    test('should NOT strip "Font" from names like "Fontana"', () => {
      const styles: TypographyStyle[] = [
        { name: 'Fontana', fontFamily: 'Roboto', fontSize: 16, fontWeight: 400, letterSpacing: 0, lineHeight: 20 }
      ];

      const result = generateFlutterTypography(styles);
      expect(result).toContain('fontana');
    });

    test('should strip "Typography-" prefix but not "Typography" alone', () => {
      const prefixedStyles: TypographyStyle[] = [
        { name: 'Typography-Body', fontFamily: 'Roboto', fontSize: 14, fontWeight: 400, letterSpacing: 0, lineHeight: 20 }
      ];

      const result = generateIOSTypography(prefixedStyles, true);
      expect(result).toContain('static let body');

      const plainStyles: TypographyStyle[] = [
        { name: 'Typography', fontFamily: 'Roboto', fontSize: 14, fontWeight: 400, letterSpacing: 0, lineHeight: 20 }
      ];

      const plainResult = generateIOSTypography(plainStyles, true);
      expect(plainResult).toContain('typography');
    });
  });

  describe('Font Weight Mapping', () => {
    test('should map font weights to SwiftUI correctly', () => {
      expect(mapFontWeightToSwiftUI(100)).toBe('ultraLight');
      expect(mapFontWeightToSwiftUI(400)).toBe('regular');
      expect(mapFontWeightToSwiftUI(700)).toBe('bold');
    });

    test('should map font weights to Flutter correctly', () => {
      expect(mapFontWeightToFlutter(100)).toBe('w100');
      expect(mapFontWeightToFlutter(400)).toBe('w400');
      expect(mapFontWeightToFlutter(700)).toBe('w700');
    });
  });
});
