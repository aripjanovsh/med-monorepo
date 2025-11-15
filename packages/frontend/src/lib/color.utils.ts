/**
 * Converts a given string to a hexadecimal color code.
 * The color is generated based on the hash of the string.
 *
 * @param {string} string - The input string to be converted into a color. Defaults to 'xyz'.
 * @return {string} A hexadecimal color code generated from the input string.
 */
export function stringToColor(string: string = "xyz"): string {
  let hash = 0;

  // Вычисление хэша строки
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  // Генерация цвета из хэша
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    const newValue = Math.floor((value + 255 * 2) / 2); // темнее чем в material ui
    color += `00${newValue.toString(16)}`.slice(-2);
  }

  return color;
}
