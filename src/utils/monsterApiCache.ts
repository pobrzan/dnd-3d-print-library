// Utility to fetch and cache the full monster list from the D&D 5e API and STL info from monsters.json

export interface ApiMonsterListItem {
  index: string;
  name: string;
  url: string;
}

export interface StlMonsterInfo {
  Name: string;
  Stl?: string;
  Url?: string;
  Description?: string;
}

let apiMonsterListCache: ApiMonsterListItem[] = [];
let stlMonsterMapCache: Map<string, StlMonsterInfo> | null = null;

const MONSTERS_JSON_VERSION = "v1"; // Increment this if you update monsters.json
const MONSTERS_JSON_LS_KEY = `stlMonstersJson_${MONSTERS_JSON_VERSION}`;

export async function getApiMonsterList(): Promise<ApiMonsterListItem[]> {
  if (apiMonsterListCache.length > 0) return apiMonsterListCache;
  const res = await fetch('https://www.dnd5eapi.co/api/2014/monsters');
  if (!res.ok) throw new Error('Failed to fetch monster list');
  const data: { results: ApiMonsterListItem[] } = await res.json();
  apiMonsterListCache = data.results;
  return apiMonsterListCache;
}

export async function getStlMonsterMap(): Promise<Map<string, StlMonsterInfo>> {
  if (stlMonsterMapCache) return stlMonsterMapCache;

  // Try localStorage first
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(MONSTERS_JSON_LS_KEY);
      if (cached) {
        const data: StlMonsterInfo[] = JSON.parse(cached);
        stlMonsterMapCache = new Map(data.map(m => [m.Name.toLowerCase(), m]));
        return stlMonsterMapCache;
      }
    } catch {
      // Ignore parse errors, fallback to network
    }
  }

  // Fallback: fetch from network
  const res = await fetch('/monsters.json');
  if (!res.ok) throw new Error('Failed to fetch STL monster list');
  const data: StlMonsterInfo[] = await res.json();
  // Save to localStorage for future loads
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(MONSTERS_JSON_LS_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota errors
    }
  }
  stlMonsterMapCache = new Map(data.map(m => [m.Name.toLowerCase(), m]));
  return stlMonsterMapCache;
}

// Fuzzy match utility for STL info
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
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

export async function getClosestStlInfo(apiMonsterName: string): Promise<StlMonsterInfo | undefined> {
  const stlMap = await getStlMonsterMap();
  const stlList = Array.from(stlMap.values());
  // Try exact match
  let best = stlList.find(m => m.Name.toLowerCase() === apiMonsterName.toLowerCase());
  if (best) return best;
  // Try partial match
  best = stlList.find(m => m.Name.toLowerCase().includes(apiMonsterName.toLowerCase()));
  if (best) return best;
  // Try first word match
  const firstWord = apiMonsterName.split(' ')[0].toLowerCase();
  best = stlList.find(m => m.Name.toLowerCase().includes(firstWord));
  if (best) return best;
  // Fuzzy match (Levenshtein)
  let minDist = Infinity;
  let closest: StlMonsterInfo | undefined = undefined;
  for (const m of stlList) {
    const dist = levenshtein(apiMonsterName, m.Name);
    if (dist < minDist) {
      minDist = dist;
      closest = m;
    }
  }
  return closest;
}

// Return all STL matches for a given API monster name (partial/first word/fuzzy)
export async function getAllStlMatches(apiMonsterName: string): Promise<StlMonsterInfo[]> {
  const stlMap = await getStlMonsterMap();
  const stlList = Array.from(stlMap.values());
  const lowerName = apiMonsterName.toLowerCase();
  const words = lowerName.split(/\s+/).filter(Boolean);

  let matches: StlMonsterInfo[] = [];
  if (words.length > 1) {
    // Multi-word: require at least two consecutive whole words to appear in order in the STL name
    matches = stlList.filter(m => {
      const stlName = m.Name.toLowerCase();
      for (let i = 0; i < words.length - 1; i++) {
        // Match only if consecutive words appear as whole words
        const regex = new RegExp(`\\b${words[i]}\\s+${words[i + 1]}\\b`, 'i');
        if (regex.test(stlName)) {
          return true;
        }
      }
      return false;
    });
  } else {
    // Single word: match only as a whole word
    matches = stlList.filter(m => {
      const stlName = m.Name.toLowerCase();
      const regex = new RegExp(`\\b${words[0]}\\b`, 'i');
      return regex.test(stlName);
    });
  }

  // First word matches (if no full phrase/word match)
  if (matches.length === 0) {
    const firstWord = words[0];
    matches = stlList.filter(m => {
      const stlName = m.Name.toLowerCase();
      const regex = new RegExp(`\\b${firstWord}\\b`, 'i');
      return regex.test(stlName);
    });
  }
  // Fuzzy fallback with threshold
  if (matches.length === 0) {
    let minDist = Infinity;
    let closest: StlMonsterInfo | undefined = undefined;
    for (const m of stlList) {
      const dist = levenshtein(apiMonsterName, m.Name);
      if (dist < minDist) {
        minDist = dist;
        closest = m;
      }
    }
    const threshold = Math.max(3, Math.floor(apiMonsterName.length * 0.25));
    if (closest && minDist <= threshold) return [closest];
    return [];
  }
  return matches;
} 