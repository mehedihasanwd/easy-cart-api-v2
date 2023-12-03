export const isNumeric = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

export const toNumberOrFalse = (
  value: string | boolean | undefined | null
): number | boolean => {
  return isNumeric(value) ? Number(value) : false;
};
