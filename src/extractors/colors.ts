import { ColorCollectionExport, ColorVariableExport } from '../types';
import { sendLog } from '../utils/debug';

export async function extractColorCollections(): Promise<ColorCollectionExport[]> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const exportData: ColorCollectionExport[] = [];

  for (const collection of collections) {
    const colorVariables: ColorVariableExport[] = [];

    for (const variableId of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(variableId);

      if (variable && variable.resolvedType === 'COLOR') {
        const variableData: ColorVariableExport = {
          id: variable.id,
          name: variable.name,
          description: variable.description || '',
          values: {}
        };

        for (const modeId in variable.valuesByMode) {
          if (Object.prototype.hasOwnProperty.call(variable.valuesByMode, modeId)) {
            const val = variable.valuesByMode[modeId] as any;

            // Handle both direct color values and variable aliases
            if (val && typeof val === 'object' && 'type' in val && val.type === 'VARIABLE_ALIAS') {
              const aliasedVariable = await figma.variables.getVariableByIdAsync(val.id);
              if (aliasedVariable && aliasedVariable.resolvedType === 'COLOR') {
                const aliasedValue = aliasedVariable.valuesByMode[modeId] as any;
                if (aliasedValue && typeof aliasedValue === 'object' && 'r' in aliasedValue) {
                  variableData.values[modeId] = {
                    r: aliasedValue.r,
                    g: aliasedValue.g,
                    b: aliasedValue.b,
                    a: aliasedValue.a ?? 1
                  };
                }
              }
            } else if (val && typeof val === 'object' && 'r' in val) {
              variableData.values[modeId] = {
                r: val.r,
                g: val.g,
                b: val.b,
                a: val.a ?? 1
              };
            }
          }
        }

        if (Object.keys(variableData.values).length > 0) {
          colorVariables.push(variableData);
        }
      }
    }

    if (colorVariables.length > 0) {
      exportData.push({
        id: collection.id,
        name: collection.name,
        modes: collection.modes.map((mode) => ({
          name: mode.name,
          modeId: mode.modeId
        })),
        variables: colorVariables
      });
    }
  }

  return exportData;
}
