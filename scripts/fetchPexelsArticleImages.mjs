import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

const apiKey = process.env.PEXELS_API_KEY;
const repoRoot = path.resolve(import.meta.dirname, '..');
const articlesFile = path.join(repoRoot, 'lib', 'articlesData.ts');
const outFile = path.join(import.meta.dirname, 'pexels-article-images.json');

if (!apiKey) {
  console.error('Missing PEXELS_API_KEY. Set it locally before running this script.');
  process.exit(1);
}

const parseTeachingPosts = () => {
  const text = fs.readFileSync(articlesFile, 'utf8');
  const exportStart = text.indexOf('export const teachingPosts');
  const equalsIndex = text.indexOf('=', exportStart);
  const arrayStart = text.indexOf('[', equalsIndex);
  const arrayEnd = text.lastIndexOf('];');
  if (exportStart === -1 || equalsIndex === -1 || arrayStart === -1 || arrayEnd === -1) {
    throw new Error('Cannot parse teachingPosts from lib/articlesData.ts');
  }
  return JSON.parse(text.slice(arrayStart, arrayEnd + 1));
};

const clean = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const queryFor = (post) => {
  const text = `${post.title} ${post.category} ${(post.tags || []).join(' ')}`;
  if (/少覆|唔覆|不回|已讀|message|訊息|回覆|秒回|遠距|異地|Long D/i.test(text)) {
    return 'asian woman texting relationship phone';
  }
  if (/第三者|新歡|出軌|偷食|變心|劈腿|外遇|信任/i.test(text)) {
    return 'asian couple relationship trust conflict';
  }
  if (/PUA|控制|操控|打壓|冷暴力|渣男|紅旗|警號|危機/i.test(text)) {
    return 'asian couple argument emotional distance';
  }
  if (/分手|失戀|放低|前任|復合|挽回|斷聯|block|冷淡/i.test(text)) {
    return 'asian woman breakup sad relationship';
  }
  if (/曖昧|約會|單身|桃花|吸引|主動|追求/i.test(text)) {
    return 'asian couple dating cafe';
  }
  if (/道歉|吵架|嗌交|冷戰|誤會|修補|和好|爭執|溝通|說話|講嘢|勸/i.test(text)) {
    return 'asian couple talking communication';
  }
  if (/安全感|不安|焦慮|內耗|委屈|情緒|治癒|自信|低落/i.test(text)) {
    return 'asian woman relationship reflection phone';
  }
  if (/結婚|同居|見家長|長期|承諾|未來|穩定/i.test(text)) {
    return 'asian couple home relationship';
  }
  return 'asian couple relationship lifestyle';
};

const blocked = /wedding|bride|groom|child|baby|family|pregnant|school|classroom|seminar|conference|army|military|soldier|football|animal|dog|cat|cartoon|illustration|drawing|logo|poster|text|nude|sex|church|politic|african|afro/i;

const getJson = (url) => new Promise((resolve, reject) => {
  https
    .get(url, {
      headers: {
        authorization: apiKey,
        'user-agent': 'Asteria article image curation'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`Pexels API ${res.statusCode}: ${data.slice(0, 200)}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error(`Pexels returned invalid JSON: ${data.slice(0, 200)}`));
        }
      });
    })
    .on('error', reject);
});

const photoToImage = (photo, post, slot) => ({
  src: photo.src?.landscape || photo.src?.large2x || photo.src?.large || photo.src?.original,
  caption: slot === 0 ? `封面圖：${post.title}` : `內文配圖：${post.title}`,
  credit: `Photo by ${photo.photographer} on Pexels`,
  creditUrl: photo.url,
  prompt: ''
});

const fetchQueryPhotos = async (query, seenPhotoIds, targetCount) => {
  const photos = [];
  for (let page = 1; page <= 10 && photos.length < targetCount; page += 1) {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=80&page=${page}`;
    const data = await getJson(url);
    for (const photo of data.photos || []) {
      const haystack = `${photo.alt || ''} ${photo.photographer || ''}`;
      if (!photo.id || seenPhotoIds.has(photo.id) || blocked.test(haystack)) continue;
      if (!photo.src?.landscape && !photo.src?.large && !photo.src?.original) continue;
      seenPhotoIds.add(photo.id);
      photos.push(photo);
      if (photos.length >= targetCount) break;
    }
    console.log(`${query} page ${page}: collected ${photos.length}/${targetCount}`);
    if (!data.next_page) break;
  }
  return photos;
};

const run = async () => {
  const posts = parseTeachingPosts();
  const usedPhotoIds = new Set();
  const existing = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : {};
  for (const images of Object.values(existing)) {
    for (const image of images || []) {
      const match = String(image.src || '').match(/photos\/(\d+)\//);
      if (match) usedPhotoIds.add(Number(match[1]));
    }
  }

  const assignments = {};
  const postsNeedingPexels = posts.filter((post) => !String(post.coverImage || '').includes('/article-custom-images/by_article/'));
  const grouped = new Map();
  for (const post of postsNeedingPexels) {
    const query = queryFor(post);
    if (!grouped.has(query)) grouped.set(query, []);
    grouped.get(query).push(post);
  }

  for (const [query, queryPosts] of grouped) {
    const needed = queryPosts.length * 4;
    let photos = await fetchQueryPhotos(query, usedPhotoIds, needed);
    if (photos.length < needed && query !== 'asian couple relationship lifestyle') {
      photos = [
        ...photos,
        ...(await fetchQueryPhotos('asian couple relationship lifestyle', usedPhotoIds, needed - photos.length))
      ];
    }
    if (photos.length < needed) {
      throw new Error(`Not enough unique Pexels photos for "${query}". Needed ${needed}, got ${photos.length}.`);
    }

    queryPosts.forEach((post, postIndex) => {
      const selected = photos.slice(postIndex * 4, postIndex * 4 + 4);
      assignments[post.id] = selected.map((photo, slot) => photoToImage(photo, post, slot));
    });
  }

  fs.writeFileSync(outFile, `${JSON.stringify(assignments, null, 2)}\n`);
  console.log(`Saved unique Pexels images for ${Object.keys(assignments).length} articles to ${outFile}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
