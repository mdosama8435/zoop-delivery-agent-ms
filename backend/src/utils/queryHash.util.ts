import crypto from 'crypto';

/**
 * Deterministically serializes and hashes query parameters to guarantee
 * identical Redis cache keys regardless of parameter ordering.
 */
export function generateQueryHash(params: Record<string, unknown>): string {
  const sortedKeys = Object.keys(params).sort();
  const sortedObj: Record<string, unknown> = {};

  for (const key of sortedKeys) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      sortedObj[key] = value;
    }
  }

  const serialized = JSON.stringify(sortedObj);
  return crypto.createHash('md5').update(serialized).digest('hex');
}
