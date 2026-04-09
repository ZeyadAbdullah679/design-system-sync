import { TypographyStyle } from '../types';
import { sendLog } from '../utils/debug';

export async function extractTypographyStyles(): Promise<TypographyStyle[]> {
  const styles: TypographyStyle[] = [];

  try {
    const textStyles = await figma.getLocalTextStylesAsync();

    sendLog(`Found ${textStyles.length} text styles in Figma`);

    for (const style of textStyles) {
      try {
        let fontFamily = 'Inter';
        let fontStyle = 'Regular';

        if (typeof style.fontName === 'object' && style.fontName !== null && 'family' in style.fontName) {
          fontFamily = style.fontName.family;
          fontStyle = style.fontName.style;
        }

        const fontSize = typeof style.fontSize === 'number' ? style.fontSize : 16;

        // Handle letter spacing
        let letterSpacing = 0;
        if (typeof style.letterSpacing === 'number') {
          letterSpacing = style.letterSpacing;
        } else if (style.letterSpacing && typeof style.letterSpacing === 'object' && 'value' in style.letterSpacing) {
          const lsObj = style.letterSpacing as { value: number; unit: string };
          letterSpacing = lsObj.value;
        }

        // Handle line height
        let lineHeight = fontSize * 1.2; // default
        if (typeof style.lineHeight === 'number') {
          lineHeight = style.lineHeight;
        } else if (style.lineHeight && typeof style.lineHeight === 'object' && 'value' in style.lineHeight) {
          const lhObj = style.lineHeight as { value: number; unit: string };
          lineHeight = lhObj.value;
        }

        // Map Figma font weight string to numeric value
        const fontWeightMap: { [key: string]: number } = {
          'Thin': 100,
          'ExtraLight': 200,
          'Light': 300,
          'Regular': 400,
          'Medium': 500,
          'SemiBold': 600,
          'Semibold': 600,
          'Bold': 700,
          'ExtraBold': 800,
          'Black': 900,
          'Heavy': 900
        };

        const fontWeight = fontWeightMap[fontStyle] || 400;

        sendLog(`Style: ${style.name} -> ${fontFamily} ${fontSize}pt, ${fontStyle} (${fontWeight})`);

        styles.push({
          name: style.name,
          fontFamily: fontFamily,
          fontSize: fontSize,
          fontWeight: fontWeight,
          letterSpacing: letterSpacing,
          lineHeight: lineHeight
        });
      } catch (styleError) {
        const errorMsg = styleError instanceof Error ? styleError.message : 'Unknown error';
        sendLog(`Error processing style ${style.name}: ${errorMsg}`, 'error');
      }
    }

    sendLog(`Successfully extracted ${styles.length} typography styles`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    sendLog(`Error in extractTypographyStyles: ${errorMsg}`, 'error');
  }

  return styles;
}
