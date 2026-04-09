export type ColorVariableExport = {
  id: string;
  name: string;
  description: string;
  values: { [modeId: string]: { r: number; g: number; b: number; a: number } };
};

export type ColorCollectionExport = {
  id: string;
  name: string;
  modes: { name: string; modeId: string }[];
  variables: ColorVariableExport[];
};

export interface TypographyStyle {
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
}
