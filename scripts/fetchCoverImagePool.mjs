import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

const queries = [
  'couple relationship',
  'couple talking cafe',
  'couple communication',
  'couple conversation',
  'couple coffee date',
  'couple phone relationship',
  'couple walking together',
  'romantic couple cafe',
  'couple conflict conversation',
  'couple holding hands',
  'couple sitting together',
  'couple love relationship',
  'couple sunset',
  'couple emotional support',
  'couple date restaurant',
  'dating couple',
  'couple discussion',
  'couple sitting sofa',
  'couple looking phone',
  'couple city date'
];

const blocked = /army|military|soldier|seminar|conference|classroom|wedding|bride|groom|child|baby|family|porn|nude|sex|church|politic|football|animal|dog|cat|cartoon|illustration|drawing|logo|text|poster/i;
const allowedLicenses = new Set(['by', 'by-sa', 'zero', 'pdm', 'cc0']);

const outFile = path.resolve(import.meta.dirname, 'cover-image-pool.json');

const clean = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const getJson = (url) => new Promise((resolve, reject) => {
  https
    .get(url, { headers: { 'user-agent': 'Asteria image curation' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error(`Openverse returned invalid JSON: ${data.slice(0, 140)}`));
        }
      });
    })
    .on('error', reject);
});

const creditFor = (item) => {
  const creator = clean(item.creator) || 'Unknown creator';
  const provider = item.provider
    ? `${item.provider[0].toUpperCase()}${item.provider.slice(1)}`
    : 'Openverse';
  const license = [item.license?.toUpperCase(), item.license_version].filter(Boolean).join(' ');
  return `Photo by ${creator} via ${provider}${license ? ` (${license})` : ''}`;
};

const isUsable = (item, seen) => {
  const title = clean(item.title);
  const tagText = (item.tags || []).map((tag) => tag.name).join(' ');
  const haystack = `${title} ${item.creator || ''} ${tagText}`;
  return (
    item.url &&
    /^https?:\/\//.test(item.url) &&
    item.foreign_landing_url &&
    /^https?:\/\//.test(item.foreign_landing_url) &&
    allowedLicenses.has(item.license) &&
    !blocked.test(haystack) &&
    !seen.has(item.url) &&
    !seen.has(item.foreign_landing_url)
  );
};

const run = async () => {
  const seen = new Set();
  const pool = [];

  for (const query of queries) {
    for (let page = 1; page <= 6; page += 1) {
      if (pool.length >= 220) break;
      const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license_type=commercial&per_page=20&page=${page}`;
      const data = await getJson(url);

      for (const item of data.results || []) {
        if (!isUsable(item, seen)) continue;
        seen.add(item.url);
        seen.add(item.foreign_landing_url);
        pool.push({
          src: item.url,
          caption: clean(item.title) || query,
          credit: creditFor(item),
          creditUrl: item.foreign_landing_url,
          license: [item.license, item.license_version].filter(Boolean).join(' '),
          licenseUrl: item.license_url || '',
          query
        });
        if (pool.length >= 220) break;
      }

      console.log(`${query} page ${page}: ${pool.length} images`);
    }
  }

  fs.writeFileSync(outFile, JSON.stringify(pool, null, 2));
  console.log(`Saved ${pool.length} images to ${outFile}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
