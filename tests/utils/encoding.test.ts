import { encodeBase64 } from '../../src/utils/encoding';
import { escapeXML, escapeIOSString, escapeJSON } from '../../src/utils/escaping';

describe('Encoding Utilities Tests', () => {
  describe('Base64 Encoding', () => {
    test('should encode simple ASCII string', () => {
      const result = encodeBase64('Hello World');
      expect(result).toBe('SGVsbG8gV29ybGQ=');
    });

    test('should encode UTF-8 string with emojis', () => {
      const result = encodeBase64('Hello 👋');
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    test('should encode Arabic text', () => {
      const result = encodeBase64('مرحبا');
      expect(result).toBeTruthy();
    });

    test('should encode empty string', () => {
      const result = encodeBase64('');
      expect(result).toBe('');
    });

    test('should encode special characters', () => {
      const result = encodeBase64('<>&"\'');
      expect(result).toBeTruthy();
    });
  });

  describe('XML Escaping', () => {
    test('should escape XML special characters', () => {
      const result = escapeXML('<tag>value & "quoted"</tag>');
      expect(result).toBe('&lt;tag&gt;value &amp; &quot;quoted&quot;&lt;/tag&gt;');
    });

    test('should escape apostrophe', () => {
      const result = escapeXML("It's working");
      expect(result).toContain('&apos;');
    });

    test('should escape newlines as \\n', () => {
      const result = escapeXML('Line1\nLine2');
      expect(result).toContain('\\n');
    });

    test('should handle empty string', () => {
      const result = escapeXML('');
      expect(result).toBe('');
    });
  });

  describe('iOS String Escaping', () => {
    test('should escape backslashes', () => {
      const result = escapeIOSString('Path\\to\\file');
      expect(result).toBe('Path\\\\to\\\\file');
    });

    test('should escape double quotes', () => {
      const result = escapeIOSString('He said "Hello"');
      expect(result).toContain('\\"');
    });

    test('should escape newlines', () => {
      const result = escapeIOSString('Line1\nLine2');
      expect(result).toContain('\\n');
    });
  });

  describe('JSON Escaping', () => {
    test('should escape backslashes for JSON', () => {
      const result = escapeJSON('C:\\path\\file');
      expect(result).toBe('C:\\\\path\\\\file');
    });

    test('should escape double quotes', () => {
      const result = escapeJSON('He said "Hello"');
      expect(result).toContain('\\"');
    });

    test('should produce valid JSON string', () => {
      const escaped = escapeJSON('Test\n"value"');
      const json = `{"key": "${escaped}"}`;

      expect(() => JSON.parse(json)).not.toThrow();
    });
  });
});
