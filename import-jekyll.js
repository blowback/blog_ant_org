#!/usr/bin/env node
/*
 * Import Jekyll posts (markdown + images) into Ghost via the Admin API.
 *
 * For each _posts/*.md file it:
 *   1. parses YAML front matter (title, date, tags),
 *   2. finds local image references, uploads each to Ghost (once, cached),
 *      and rewrites the reference to the returned Ghost URL,
 *   3. renders the markdown to HTML,
 *   4. creates the post with source:'html' (Ghost converts to Lexical),
 *      using the Jekyll date as published_at and the filename slug.
 *
 * Idempotency: posts are matched by slug; an existing post with the same slug
 * is updated rather than duplicated. Re-running is safe.
 *
 * Usage:
 *   npm install @tryghost/admin-api gray-matter markdown-it
 *   GHOST_URL=https://blog.ant.org \
 *   GHOST_ADMIN_KEY=<id>:<secret> \
 *   node import-jekyll.js [--dry-run] [--draft] [path/to/jekyll/repo]
 *
 * Env:
 *   GHOST_URL         e.g. https://blog.ant.org   (no trailing slash)
 *   GHOST_ADMIN_KEY   the "Admin API key" from a Ghost Custom Integration,
 *                     in the form  <26-hex-id>:<64-hex-secret>
 *
 * Flags:
 *   --dry-run   parse + resolve images, but don't upload or create anything
 *   --draft     create posts as drafts instead of published
 */

const fs = require('fs');
const path = require('path');
const GhostAdminAPI = require('@tryghost/admin-api');
const matter = require('gray-matter');
const MarkdownIt = require('markdown-it');

// ---- config ----
const REPO = process.argv.find((a, i) => i >= 2 && !a.startsWith('--')) || '.';
const DRY_RUN = process.argv.includes('--dry-run');
const AS_DRAFT = process.argv.includes('--draft');
const POSTS_DIR = path.join(REPO, '_posts');

const GHOST_URL = process.env.GHOST_URL;
const GHOST_ADMIN_KEY = process.env.GHOST_ADMIN_KEY;

if (!GHOST_URL || !GHOST_ADMIN_KEY) {
  console.error('Set GHOST_URL and GHOST_ADMIN_KEY (see header comment).');
  process.exit(1);
}

const md = new MarkdownIt({ html: true, linkify: true });

const api = new GhostAdminAPI({
  url: GHOST_URL,
  key: GHOST_ADMIN_KEY,
  version: 'v5.0',
});

// Cache: local image path -> uploaded Ghost URL (upload each image once)
const uploadedImages = new Map();

// Resolve a markdown image reference to an absolute file path in the repo.
// Handles "/assets/img/x.png", "assets/img/x.png", "../assets/x.png", etc.
function resolveImagePath(ref, postFile) {
  if (/^https?:\/\//i.test(ref)) return null; // already remote, leave alone
  const clean = ref.split('#')[0].split('?')[0];

  // Path forms to try: the ref as-written, and the ref re-anchored at its
  // first "assets/" segment — this strips a Jekyll baseurl prefix such as
  // /antforth/ that has no counterpart on disk.
  const forms = new Set([clean]);
  const anchor = clean.match(/(?:^|\/)(assets\/.*)$/);
  if (anchor) forms.add('/' + anchor[1]);

  // For each form, also try img<->images swapped (the (\/) guard stops
  // "img" matching inside "images").
  const variants = new Set();
  for (const f of forms) {
    variants.add(f);
    variants.add(f.replace(/(^|\/)assets\/images(\/)/g, '$1assets/img$2'));
    variants.add(f.replace(/(^|\/)assets\/img(\/)/g, '$1assets/images$2'));
  }

  const bases = [
    (p) => path.join(REPO, p.replace(/^\//, '')), // repo-root relative
    (p) => path.join(path.dirname(postFile), p),  // post-relative
  ];

  for (const v of variants) {
    for (const toAbs of bases) {
      const c = toAbs(v);
      if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
    }
  }
  return null;
}

async function uploadImage(absPath) {
  if (uploadedImages.has(absPath)) return uploadedImages.get(absPath);
  if (DRY_RUN) {
    const fake = `[would-upload]${path.basename(absPath)}`;
    uploadedImages.set(absPath, fake);
    return fake;
  }
  const res = await api.images.upload({ file: absPath });
  uploadedImages.set(absPath, res.url);
  return res.url;
}

// Rewrite all local image refs in markdown to their uploaded Ghost URLs.
// Matches markdown  ![alt](path "title")  and inline HTML <img src="path">.
async function rewriteImages(markdown, postFile) {
  const mdImg = /!\[([^\]]*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g;
  const htmlImg = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g;

  const refs = new Set();
  let m;
  while ((m = mdImg.exec(markdown)) !== null) refs.add(m[2]);
  while ((m = htmlImg.exec(markdown)) !== null) refs.add(m[1]);

  let out = markdown;
  for (const ref of refs) {
    const abs = resolveImagePath(ref, postFile);
    if (!abs) {
      if (!/^https?:\/\//i.test(ref)) {
        console.warn(`  ! image not found, leaving as-is: ${ref}`);
      }
      continue;
    }
    const url = await uploadImage(abs);
    // replace every occurrence of this exact ref
    out = out.split(ref).join(url);
    console.log(`  img ${ref} -> ${url}`);
  }
  return out;
}

// Filename: YYYY-MM-DD-some-slug.md  ->  { date, slug }
function parseFilename(file) {
  const base = path.basename(file, path.extname(file));
  const m = base.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
  if (!m) return { date: null, slug: base };
  return { date: `${m[1]}-${m[2]}-${m[3]}`, slug: m[4] };
}

function toTags(fm) {
  const raw = []
    .concat(fm.tags || [])
    .concat(fm.categories || [])
    .flatMap((t) => (typeof t === 'string' ? t.split(/\s+/) : t))
    .filter(Boolean);
  return [...new Set(raw)].map((name) => ({ name }));
}

async function findExistingBySlug(slug) {
  if (DRY_RUN) return null;
  try {
    return await api.posts.read({ slug });
  } catch (e) {
    return null; // not found
  }
}

async function importPost(file) {
  const src = fs.readFileSync(file, 'utf8');
  const { data: fm, content } = matter(src);
  const { date: fnDate, slug } = parseFilename(file);

  const title = fm.title || slug;
  const published_at = new Date(fm.date || fnDate || Date.now()).toISOString();

  console.log(`\n• ${path.basename(file)}  ->  "${title}" (slug: ${slug})`);

  const rewritten = await rewriteImages(content, file);
  const html = md.render(rewritten);

  const payload = {
    title,
    slug,
    html,
    status: AS_DRAFT ? 'draft' : 'published',
    published_at,
    tags: toTags(fm),
  };
  if (fm.excerpt) payload.custom_excerpt = String(fm.excerpt).slice(0, 300);

  if (DRY_RUN) {
    console.log(`  [dry-run] would ${AS_DRAFT ? 'draft' : 'publish'} (${html.length} bytes html, ${payload.tags.length} tags)`);
    return;
  }

  const existing = await findExistingBySlug(slug);
  if (existing) {
    await api.posts.edit(
      { ...payload, id: existing.id, updated_at: existing.updated_at },
      { source: 'html' }
    );
    console.log('  updated existing post');
  } else {
    await api.posts.add(payload, { source: 'html' });
    console.log('  created');
  }
}

async function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`No _posts dir at ${POSTS_DIR}`);
    process.exit(1);
  }
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.(md|markdown)$/i.test(f))
    .sort()
    .map((f) => path.join(POSTS_DIR, f));

  console.log(`Importing ${files.length} posts from ${POSTS_DIR}`);
  console.log(`Target: ${GHOST_URL}  ${DRY_RUN ? '(DRY RUN)' : ''} ${AS_DRAFT ? '(as drafts)' : ''}`);

  for (const file of files) {
    try {
      await importPost(file);
    } catch (e) {
      console.error(`  ERROR on ${path.basename(file)}: ${e.message}`);
    }
  }
  console.log(`\nDone. ${uploadedImages.size} unique images handled.`);
}

main();
