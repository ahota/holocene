import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHUNK_SIZE = 2000;
const masterFile = path.join(__dirname, '../src/data/all_events.json');
const outputDir = path.join(__dirname, '../public/data');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const events = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
const chunks = {};

events.forEach(event => {
  const chunkIndex = Math.floor(event.year / CHUNK_SIZE) * CHUNK_SIZE;
  if (!chunks[chunkIndex]) chunks[chunkIndex] = [];
  chunks[chunkIndex].push(event);
});

Object.keys(chunks).forEach(index => {
  fs.writeFileSync(
    path.join(outputDir, `events_${index}.json`),
    JSON.stringify(chunks[index], null, 2)
  );
});
console.log(`Partitioned into ${Object.keys(chunks).length} chunks.`);
