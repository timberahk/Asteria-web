import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve(import.meta.dirname, '..');
const articlesFile = path.join(repoRoot, 'lib', 'articlesData.ts');
const pexelsArticleImagesFile = path.join(import.meta.dirname, 'pexels-article-images.json');
const outDir = path.join(repoRoot, 'public', 'article-custom-images', 'stock_local');
const publicPrefix = '/article-custom-images/stock_local';

const imageUrlPattern = /https:\/\/images\.pexels\.com\/photos\/(\d+)\/[^"'\s]+/g;

const download = (url, outPath) => new Promise((resolve, reject) => {
  https.get(url, { headers: { 'user-agent': 'Asteria article image localizer' } }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      download(res.headers.location, outPath).then(resolve, reject);
      return;
    }
    if (res.statusCode < 200 || res.statusCode >= 300) {
      reject(new Error(`Download failed ${res.statusCode}: ${url}`));
      return;
    }
    const file = fs.createWriteStream(outPath);
    res.pipe(file);
    file.on('finish', () => {
      file.close(resolve);
    });
  }).on('error', reject);
});

const runSips = (file) => {
  const result = spawnSync('sips', [
    '-s',
    'format',
    'jpeg',
    '-s',
    'formatOptions',
    '74',
    '--resampleWidth',
    '1400',
    file,
    '--out',
    file
  ], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`sips failed for ${file}: ${result.stderr || result.stdout}`);
  }
};

const run = async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const files = [articlesFile, pexelsArticleImagesFile].filter((file) => fs.existsSync(file));
  const sources = new Map(files.map((file) => [file, fs.readFileSync(file, 'utf8')]));
  const matches = [...sources.values()].flatMap((source) => [...source.matchAll(imageUrlPattern)]);
  const unique = new Map(matches.map((match) => [match[0], match[1]]));

  for (const [url, id] of unique) {
    const filename = `pexels-${id}.jpg`;
    const outPath = path.join(outDir, filename);
    if (!fs.existsSync(outPath)) {
      const tmpPath = `${outPath}.download`;
      await download(url, tmpPath);
      fs.renameSync(tmpPath, outPath);
      runSips(outPath);
      console.log(`Downloaded ${filename}`);
    } else {
      console.log(`Already exists ${filename}`);
    }
    for (const [file, source] of sources) {
      sources.set(file, source.split(url).join(`${publicPrefix}/${filename}`));
    }
  }

  for (const [file, source] of sources) {
    fs.writeFileSync(file, source);
  }
  console.log(`Localized ${unique.size} unique Pexels image URLs.`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
