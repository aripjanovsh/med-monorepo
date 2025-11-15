let counter = 0;

export function generateElementId(prefix: string): string {
  if (typeof window === "undefined") {
    // На сервере используем простой счетчик
    return `${prefix}-ssr-${counter++}`;
  }
  // На клиенте используем timestamp + счетчик для уникальности
  return `${prefix}-${Date.now()}-${counter++}`;
}
