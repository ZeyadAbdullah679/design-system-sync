import { DEFAULT_LANGUAGE_MAP } from '../constants';
import { escapeXML, escapeIOSString } from '../utils/escaping';

export function parseVariablesToAndroidXML(collections: any[]): { [lang: string]: string } {
  const xmlByLanguage: { [lang: string]: string } = {};

  collections.forEach(collection => {
    const modeMap: { [modeId: string]: string } = {};
    collection.modes.forEach((mode: any) => {
      modeMap[mode.modeId] = DEFAULT_LANGUAGE_MAP[mode.name] || mode.name.toLowerCase().substring(0, 2);
    });

    const stringsByLanguage: { [lang: string]: { [key: string]: string } } = {};

    collection.variables.forEach((variable: any) => {
      if (variable.type !== 'STRING') return;

      const varName = variable.name;

      Object.entries(variable.values).forEach(([modeId, value]) => {
        const langCode = modeMap[modeId];

        if (!stringsByLanguage[langCode]) {
          stringsByLanguage[langCode] = {};
        }

        stringsByLanguage[langCode][varName] = value as string;
      });
    });

    Object.entries(stringsByLanguage).forEach(([langCode, strings]) => {
      let xml = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n';

      Object.entries(strings).forEach(([key, value]) => {
        const escapedValue = escapeXML(value);
        xml += `    <string name="${key}">${escapedValue}</string>\n`;
      });

      xml += '</resources>';
      xmlByLanguage[langCode] = xml;
    });
  });

  return xmlByLanguage;
}

export function parseVariablesToIOSStrings(collections: any[]): { [lang: string]: string } {
  const stringsByLanguage: { [lang: string]: string } = {};

  collections.forEach(collection => {
    const modeMap: { [modeId: string]: string } = {};
    collection.modes.forEach((mode: any) => {
      modeMap[mode.modeId] = DEFAULT_LANGUAGE_MAP[mode.name] || mode.name.toLowerCase().substring(0, 2);
    });

    const stringsData: { [lang: string]: { [key: string]: string } } = {};

    collection.variables.forEach((variable: any) => {
      if (variable.type !== 'STRING') return;

      const varName = variable.name;

      Object.entries(variable.values).forEach(([modeId, value]) => {
        const langCode = modeMap[modeId];

        if (!stringsData[langCode]) {
          stringsData[langCode] = {};
        }

        stringsData[langCode][varName] = value as string;
      });
    });

    Object.entries(stringsData).forEach(([langCode, strings]) => {
      let content = '/* Localization strings generated from Figma */\n\n';

      Object.entries(strings).forEach(([key, value]) => {
        const escapedValue = escapeIOSString(value);
        content += `"${key}" = "${escapedValue}";\n`;
      });

      stringsByLanguage[langCode] = content;
    });
  });

  return stringsByLanguage;
}

export function parseVariablesToFlutterARB(collections: any[]): { [lang: string]: string } {
  const arbByLanguage: { [lang: string]: string } = {};

  collections.forEach(collection => {
    const modeMap: { [modeId: string]: string } = {};
    collection.modes.forEach((mode: any) => {
      modeMap[mode.modeId] = DEFAULT_LANGUAGE_MAP[mode.name] || mode.name.toLowerCase().substring(0, 2);
    });

    const stringsData: { [lang: string]: { [key: string]: string } } = {};

    collection.variables.forEach((variable: any) => {
      if (variable.type !== 'STRING') return;

      const varName = variable.name;

      Object.entries(variable.values).forEach(([modeId, value]) => {
        const langCode = modeMap[modeId];

        if (!stringsData[langCode]) {
          stringsData[langCode] = {};
        }

        stringsData[langCode][varName] = value as string;
      });
    });

    Object.entries(stringsData).forEach(([langCode, strings]) => {
      const arbObj: any = {
        "@@locale": langCode
      };

      Object.entries(strings).forEach(([key, value]) => {
        arbObj[key] = value;
      });

      arbByLanguage[langCode] = JSON.stringify(arbObj, null, 2);
    });
  });

  return arbByLanguage;
}
