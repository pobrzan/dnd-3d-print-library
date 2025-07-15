export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

async function getDownloadLinksWithPuppeteer(url: string): Promise<string[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  let links: string[] = [];
  try {
    // Try common button selectors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const button = await (page as any).$x("//a[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'download all')] | //button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'download all')]");
    if (button.length > 0) {
      await button[0].click();
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
      const newLinks = await page.$$eval('a', as => as.map(a => a.href).filter(href => href && href.startsWith('http') && href.toLowerCase().includes('download')));
      links = newLinks;
    }
  } catch {
    // Ignore errors, fallback to cheerio
  }
  await browser.close();
  return links;
}

export async function POST(req: NextRequest) {
  try {
    const { urls } = await req.json();
    if (!Array.isArray(urls)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const results: { landing: string; downloadLinks: string[] }[] = [];

    for (const url of urls) {
      let links: string[] = [];
      try {
        // Try Puppeteer first
        links = await getDownloadLinksWithPuppeteer(url);
      } catch {}
      if (!links || links.length === 0) {
        // Fallback to Cheerio scraping
        try {
          const res = await fetch(url);
          const html = await res.text();
          const $ = cheerio.load(html);
          $("a,button").each((_, el) => {
            const text = $(el).text().toLowerCase();
            if (text.includes('download all')) {
              const href = $(el).attr('href');
              if (href && href.startsWith('http')) links.push(href);
            }
          });
          if (links.length === 0) {
            $("a").each((_, el) => {
              const text = $(el).text().toLowerCase();
              if (text.includes('download')) {
                const href = $(el).attr('href');
                if (href && href.startsWith('http')) links.push(href);
              }
            });
          }
        } catch {}
      }
      results.push({ landing: url, downloadLinks: links });
    }
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 