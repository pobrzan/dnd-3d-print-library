"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

interface Monster {
  Name: string;
  Url: string;
  Description: string;
}

function extractLandingUrl(description: string): string {
  // Extract the last URL in the description string
  const urlMatch = description.match(/https?:\/\/[^\s]+/g);
  return urlMatch ? urlMatch[urlMatch.length - 1] : "";
}

function stripFileExtension(name: string): string {
  return name.replace(/\.[a-zA-Z0-9]+$/, "");
}

export default function Home() {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const hideShapeways = true;
  const [lightbox, setLightbox] = useState<{ url: string; alt: string } | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/monsters.json")
      .then((res) => res.json())
      .then((data) => {
        setMonsters(data);
        setLoading(false);
      });
  }, []);

  // Sort and filter monsters
  const filteredMonsters = monsters
    .filter(monster => {
      const url = extractLandingUrl(monster.Description).toLowerCase();
      if (hideShapeways && url.includes('shapeways')) return false;
      if (!extractLandingUrl(monster.Description)) return false;
      if (search && !monster.Name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' }));

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
            </div>
            <div className={styles.grid}>
              {filteredMonsters.map((monster, idx) => (
                <div key={monster.Name + '-' + idx} className={styles.card}>
                  <div
                    className={styles.cardImageWrapper}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setLightbox({ url: monster.Url, alt: monster.Name })}
                  >
                    <Image
                      src={monster.Url}
                      alt={monster.Name}
                      fill
                      className={styles.monsterImg}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.monsterName}>
                      {stripFileExtension(monster.Name)}
                    </h3>
                    <a
                      href={extractLandingUrl(monster.Description)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.downloadBtn}
                    >
                      View & Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      {lightbox && (
        <div className={styles.lightboxOverlay} onClick={() => setLightbox(null)}>
          <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>
              CLOSE
            </button>
            <img
              src={lightbox.url}
              alt={lightbox.alt}
              className={styles.lightboxImg}
            />
            <a
              href={extractLandingUrl(lightbox.alt)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.downloadBtn}
              style={{ marginBottom: 12 }}
            >
              View & Download
            </a>
            <div className={styles.lightboxCaption}>
              {stripFileExtension(lightbox.alt)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
