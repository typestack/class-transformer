export function isObject(value: unknown): value is Record<string | symbol, any> {
  return Boolean((typeof value === 'object' && value) || typeof value === 'function');
}
