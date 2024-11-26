export const slugify = (str = '') =>
  str
    .toLowerCase()
    .replace(/[àÀáÁâÂãäÄÅåª]+/g, 'a') // Special Characters #1
    .replace(/[èÈéÉêÊëË]+/g, 'e') // Special Characters #2
    .replace(/[ìÌíÍîÎïÏ]+/g, 'i') // Special Characters #3
    .replace(/[òÒóÓôÔõÕöÖº]+/g, 'o') // Special Characters #4
    .replace(/[ùÙúÚûÛüÜ]+/g, 'u') // Special Characters #5
    .replace(/[ýÝÿŸ]+/g, 'y') // Special Characters #6
    .replace(/[ñÑ]+/g, 'n') // Special Characters #7
    .replace(/[çÇ]+/g, 'c') // Special Characters #8
    .replace(/[ß]+/g, 'ss') // Special Characters #9
    .replace(/[Ææ]+/g, 'ae') // Special Characters #10
    .replace(/[Øøœ]+/g, 'oe') // Special Characters #11
    .replace(/[%]+/g, 'pct') // Special Characters #12
    .replace(/\s+/g, '_') // Replace spaces with _
    .replace(/\-+/g, '_') // Replace spaces with _
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\_\_+/g, '_') // Replace multiple _ with single _
    .replace(/^_+/, '') // Trim - from start of text
    .replace(/_+$/, ''); // Trim - from end of text

export const extractCurrentBundleID = data => {
  try {
    const namespaceRegex = /\bnamespace\s+"([^"]+)"/;

    const match = data.match(namespaceRegex);

    if (match && match[1]) {
      return match[1];
    } else {
      throw new Error('Namespace property not found in the file.');
    }
  } catch (error) {
    console.error('Error reading the file or extracting the namespace:', error.message);

    return null;
  }
};
