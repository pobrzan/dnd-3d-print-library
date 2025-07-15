// Utility to find the closest match using Levenshtein distance
export function getClosestMatch(search: string, names: string[]): { name: string; index: number } | null {
  function levenshtein(a: string, b: string): number {
    const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1, // deletion
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j - 1] + 1 // substitution
          );
        }
      }
    }
    return matrix[a.length][b.length];
  }
  let minDist = Infinity;
  let bestIdx = -1;
  for (let i = 0; i < names.length; i++) {
    const dist = levenshtein(search, names[i]);
    if (dist < minDist) {
      minDist = dist;
      bestIdx = i;
    }
  }
  if (bestIdx === -1) return null;
  return { name: names[bestIdx], index: bestIdx };
} 