"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { getApiMonsterList, getAllStlMatches, ApiMonsterListItem, StlMonsterInfo } from "../utils/monsterApiCache";

interface MonsterDetails {
  type: string;
  size: string;
  alignment: string;
  armor_class: number | string | { type: string; value: number } | Array<{ type: string; value: number }>;
  hit_points: number;
  challenge_rating: number | string;
  actions?: { name: string; desc: string }[];
  speed?: Record<string, string>;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  saving_throws?: Record<string, number>;
  skills?: Record<string, number>;
  senses?: Record<string, string | number>;
  languages?: string;
  damage_resistances?: string[] | string;
  damage_immunities?: string[] | string;
  damage_vulnerabilities?: string[] | string;
  condition_immunities?: Array<{ name: string }> | string[] | string;
  special_abilities?: { name: string; desc: string }[];
  legendary_actions?: { name: string; desc: string }[];
  xp?: number;
  image?: string; // Added for API monster details
}

// Helper to resolve API image URLs
function resolveApiImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `https://www.dnd5eapi.co${url}`;
}

export default function Home() {
  const [monsters, setMonsters] = useState<ApiMonsterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [monsterDetails, setMonsterDetails] = useState<MonsterDetails | null>(null);
  const [modalMonster, setModalMonster] = useState<ApiMonsterListItem | null>(null);
  const [stlMatchMap, setStlMatchMap] = useState<Record<string, StlMonsterInfo[]>>({});
  const [onlyWithStl, setOnlyWithStl] = useState(false);

  // Load API monster list and STL map on mount
  useEffect(() => {
    (async () => {
      const apiList = await getApiMonsterList();
      setMonsters(apiList);
      // For each monster, find the closest STL match
      const matchEntries = await Promise.all(
        apiList.map(async (m) => [m.index, await getAllStlMatches(m.name)])
      );
      setStlMatchMap(Object.fromEntries(matchEntries));
      setLoading(false);
    })();
  }, []);

  // Filtered monsters by search and STL toggle
  const filteredMonsters = monsters.filter(monster => {
    const matchesSearch = monster.name.toLowerCase().includes(search.toLowerCase());
    const hasStl = (stlMatchMap[monster.index] || []).length > 0;
    return matchesSearch && (!onlyWithStl || hasStl);
  });

  // Get STL info for a monster (case-insensitive)
  function getStlMatches(monster: ApiMonsterListItem): StlMonsterInfo[] {
    return stlMatchMap[monster.index] || [];
  }

  // Modal open handler
  async function handleMonsterClick(monster: ApiMonsterListItem) {
    setModalMonster(monster);
    setMonsterDetails(null);
    // Fetch details from API
    const detailsRes = await fetch(`https://www.dnd5eapi.co/api/2014/monsters/${monster.index}`);
    if (detailsRes.ok) {
      setMonsterDetails(await detailsRes.json());
    }
  }

  // Modal close handler
  function closeModal() {
    setModalMonster(null);
    setMonsterDetails(null);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image src="/favicon-mm-stl.png" alt="D&D STL Logo" width={32} height={32} style={{ display: 'inline-block' }} />
          <h1 className={styles.title}>D&D STL Monster Library</h1>
        </div>
        <p className={styles.subtitle}>Browse and download 3D printable monsters for your tabletop adventures.</p>
      </header>
      <main className={styles.main}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className={styles.controls}>
              <input
                type="text"
                placeholder="Search monsters..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={styles.searchInput}
                style={{ minWidth: 180, padding: '8px 12px', borderRadius: 6, border: '1.5px solid #bacc81', fontSize: '1rem' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1rem', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={onlyWithStl}
                  onChange={e => setOnlyWithStl(e.target.checked)}
                  style={{ marginRight: 4 }}
                />
                Only show monsters with STL files
              </label>
            </div>
            <div className={styles.grid}>
              {filteredMonsters.map((monster) => {
                const stlMatches = getStlMatches(monster);
                return (
                  <div key={monster.index} className={styles.card}>
                    <div className={styles.cardBody}>
                      <h3 className={styles.monsterName}>
                        {monster.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12, marginTop: 8 }}>
                      <button
                        className={styles.downloadBtn}
                        style={{ background: '#eee', color: '#222', border: '2px solid #222' }}
                        onClick={() => handleMonsterClick(monster)}
                      >
                        View Details
                      </button>
                      {stlMatches.length > 0 && (
                          <span className={styles.stlBadge}>STL</span>
                        )}
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      {modalMonster && (
        <div className={styles.lightboxOverlay} onClick={closeModal}>
          <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={closeModal}>
              CLOSE
            </button>
            {/* Modal Heading with monster name and type badge */}
            {monsterDetails && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: '1.5em', fontWeight: 700 }}>{modalMonster.name}</h2>
                {monsterDetails.type && (
                  <span style={{ background: '#bacc81', color: '#222', borderRadius: 8, padding: '4px 12px', fontWeight: 600, fontSize: '1em', textTransform: 'capitalize', border: '2px solid #222' }}>{monsterDetails.type}</span>
                )}
              </div>
            )}
            {/* API Monster Details (with API image inside) */}
            {monsterDetails && (
              <div className={styles.monsterApiDetails} style={{ textAlign: 'left', position: 'relative' }}>
                {monsterDetails.image && (
                  <div
                    className={styles.monsterApiImgWrapper}
                    style={{ float: 'right', margin: '0 0 8px 16px', overflow: 'hidden', borderRadius: 8, border: '2px solid #ccc', background: '#fff', maxWidth: '100%' }}
                  >
                    <img
                      src={resolveApiImageUrl(monsterDetails.image)}
                      alt={modalMonster?.name}
                      className={styles.monsterApiImg}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                )}
                <h4>Monster Details</h4>
                <div><b>Type:</b> {monsterDetails.type}</div>
                <div><b>Size:</b> {monsterDetails.size}</div>
                <div><b>Alignment:</b> {monsterDetails.alignment}</div>
                <div>
                  <b>Armor Class:</b>{" "}
                  {Array.isArray(monsterDetails.armor_class)
                    ? monsterDetails.armor_class.map(ac =>
                        typeof ac === "object"
                          ? `${ac.value} (${ac.type})`
                          : ac
                      ).join(", ")
                    : typeof monsterDetails.armor_class === "object"
                      ? `${(monsterDetails.armor_class as { value: number; type: string }).value} (${(monsterDetails.armor_class as { value: number; type: string }).type})`
                      : monsterDetails.armor_class}
                </div>
                <div><b>Hit Points:</b> {monsterDetails.hit_points}</div>
                <div><b>Challenge Rating:</b> {monsterDetails.challenge_rating}</div>
                {monsterDetails.xp !== undefined && (
                  <div><b>XP:</b> {monsterDetails.xp}</div>
                )}
                {monsterDetails.speed && (
                  <div><b>Speed:</b> {Object.entries(monsterDetails.speed).map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
                )}
                {(monsterDetails.strength !== undefined || monsterDetails.dexterity !== undefined || monsterDetails.constitution !== undefined || monsterDetails.intelligence !== undefined || monsterDetails.wisdom !== undefined || monsterDetails.charisma !== undefined) && (
                  <div><b>Abilities:</b> STR {monsterDetails.strength} / DEX {monsterDetails.dexterity} / CON {monsterDetails.constitution} / INT {monsterDetails.intelligence} / WIS {monsterDetails.wisdom} / CHA {monsterDetails.charisma}</div>
                )}
                {monsterDetails.saving_throws && Object.keys(monsterDetails.saving_throws).length > 0 && (
                  <div><b>Saving Throws:</b> {Object.entries(monsterDetails.saving_throws).map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
                )}
                {monsterDetails.skills && Object.keys(monsterDetails.skills).length > 0 && (
                  <div><b>Skills:</b> {Object.entries(monsterDetails.skills).map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
                )}
                {monsterDetails.senses && Object.keys(monsterDetails.senses).length > 0 && (
                  <div><b>Senses:</b> {Object.entries(monsterDetails.senses).map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
                )}
                {monsterDetails.languages && (
                  <div><b>Languages:</b> {monsterDetails.languages}</div>
                )}
                {monsterDetails.damage_resistances && (
                  <div><b>Damage Resistances:</b> {Array.isArray(monsterDetails.damage_resistances) ? monsterDetails.damage_resistances.join(', ') : monsterDetails.damage_resistances}</div>
                )}
                {monsterDetails.damage_immunities && (
                  <div><b>Damage Immunities:</b> {Array.isArray(monsterDetails.damage_immunities) ? monsterDetails.damage_immunities.join(', ') : monsterDetails.damage_immunities}</div>
                )}
                {monsterDetails.damage_vulnerabilities && (
                  <div><b>Damage Vulnerabilities:</b> {Array.isArray(monsterDetails.damage_vulnerabilities) ? monsterDetails.damage_vulnerabilities.join(', ') : monsterDetails.damage_vulnerabilities}</div>
                )}
                {monsterDetails.condition_immunities && (
                  <div><b>Condition Immunities:</b> {Array.isArray(monsterDetails.condition_immunities)
                    ? monsterDetails.condition_immunities.map(ci => typeof ci === 'string' ? ci : ci.name).join(', ')
                    : monsterDetails.condition_immunities}
                  </div>
                )}
                {monsterDetails.special_abilities && monsterDetails.special_abilities.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <b>Special Abilities:</b>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {monsterDetails.special_abilities.map((a, i) => (
                        <li key={i}><b>{a.name}:</b> {a.desc}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {monsterDetails.legendary_actions && monsterDetails.legendary_actions.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <b>Legendary Actions:</b>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {monsterDetails.legendary_actions.map((a, i) => (
                        <li key={i}><b>{a.name}:</b> {a.desc}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div><b>Actions:</b> {monsterDetails.actions && monsterDetails.actions.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {monsterDetails.actions.map((a, i) => (
                      <li key={i}><b>{a.name}:</b> {a.desc}</li>
                    ))}
                  </ul>
                ) : 'None'}
                </div>
              </div>
            )}
            {/* STL Section: clearer, grouped, with image, button, and description, below details */}
            {modalMonster && getStlMatches(modalMonster).length > 0 && (
              <div style={{ marginTop: 18 }}>
                <h4 style={{ marginBottom: 8 }}>Related STL Files</h4>
                {getStlMatches(modalMonster).map((stl, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, background: '#f8f8f8', borderRadius: 6, padding: 8, border: '1px solid #eee' }}>
                    {stl.Url && (
                      <img
                        src={stl.Url}
                        alt={modalMonster.name}
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc', background: '#fff' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      {stl.Stl && (
                        <a
                          href={stl.Stl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.downloadBtn}
                          style={{ marginBottom: 4, display: 'inline-block' }}
                        >
                          Download STL
                        </a>
                      )}
                      {stl.Description && (
                        <div style={{ fontSize: '0.95em', color: '#444', marginTop: 2 }}>{stl.Description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
