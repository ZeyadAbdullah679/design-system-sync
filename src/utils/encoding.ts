export function encodeBase64(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';

  const utf8Bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode < 0x80) {
      utf8Bytes.push(charCode);
    } else if (charCode < 0x800) {
      utf8Bytes.push(0xc0 | (charCode >> 6));
      utf8Bytes.push(0x80 | (charCode & 0x3f));
    } else if (charCode < 0x10000) {
      utf8Bytes.push(0xe0 | (charCode >> 12));
      utf8Bytes.push(0x80 | ((charCode >> 6) & 0x3f));
      utf8Bytes.push(0x80 | (charCode & 0x3f));
    } else {
      utf8Bytes.push(0xf0 | (charCode >> 18));
      utf8Bytes.push(0x80 | ((charCode >> 12) & 0x3f));
      utf8Bytes.push(0x80 | ((charCode >> 6) & 0x3f));
      utf8Bytes.push(0x80 | (charCode & 0x3f));
    }
  }

  for (let i = 0; i < utf8Bytes.length; i += 3) {
    const b1 = utf8Bytes[i];
    const b2 = i + 1 < utf8Bytes.length ? utf8Bytes[i + 1] : 0;
    const b3 = i + 2 < utf8Bytes.length ? utf8Bytes[i + 2] : 0;

    const enc1 = b1 >> 2;
    const enc2 = ((b1 & 3) << 4) | (b2 >> 4);
    const enc3 = ((b2 & 15) << 2) | (b3 >> 6);
    const enc4 = b3 & 63;

    output += chars.charAt(enc1);
    output += chars.charAt(enc2);
    output += i + 1 < utf8Bytes.length ? chars.charAt(enc3) : '=';
    output += i + 2 < utf8Bytes.length ? chars.charAt(enc4) : '=';
  }

  return output;
}
