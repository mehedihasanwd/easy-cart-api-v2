// Helpers
const lowerCaseAndTrim = (title: string): string => {
  return title.toLowerCase().trim();
};

const upperCaseAndTrim = (title: string): string => {
  return title.toUpperCase().trim();
};

const splitAndFilter = (title: string): string[] => {
  return title
    .split(" ")
    .filter(
      (item: string) =>
        !["", " ", "''", ".", "'", undefined, null, false, true].includes(item)
    );
};

/* Main functions: start */
export const convertTextToUrl = (title: string): string => {
  return convertTextToTags(title).join("-");
};

export const capitalizeText = (text: string): string => {
  const converted_text = `${text.charAt(0).toUpperCase()}${lowerCaseAndTrim(
    text.slice(1)
  )}`;

  return splitAndFilter(converted_text).join(" ");
};

export const convertTextToTags = (text: string): string[] => {
  return splitAndFilter(lowerCaseAndTrim(text));
};

export const convertStringToSizes = (text: string): string[] => {
  return splitAndFilter(upperCaseAndTrim(text));
};
