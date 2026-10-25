import fs from 'node:fs';

const csv = fs.readFileSync('knowledge/content/asset-prompts-2026-10-25.csv', 'utf8').replace(/^\uFEFF/, '');

const rows = [];
let field = '';
let record = [];
let inQuotes = false;
for (let i = 0; i < csv.length; i += 1) {
  const ch = csv[i];
  if (inQuotes) {
    if (ch === '"' && csv[i + 1] === '"') {
      field += '"';
      i += 1;
    } else if (ch === '"') {
      inQuotes = false;
    } else {
      field += ch;
    }
  } else if (ch === '"') {
    inQuotes = true;
  } else if (ch === ',') {
    record.push(field);
    field = '';
  } else if (ch === '\n') {
    record.push(field);
    if (record.some((value) => value.length)) rows.push(record);
    record = [];
    field = '';
  } else if (ch !== '\r') {
    field += ch;
  }
}
if (field.length || record.length) {
  record.push(field);
  if (record.some((value) => value.length)) rows.push(record);
}

const header = rows.shift();
const idx = Object.fromEntries(header.map((key, index) => [key, index]));

const queue = rows
  .filter((row) => row[idx.type] === 'image-materi' && /^[123]$/.test(row[idx.grade]))
  .map((row) => ({
    id: row[idx.assetId].replace(/^materi-/, ''),
    grade: row[idx.grade],
    subject: row[idx.subject],
    title: row[idx.title],
    prompt: row[idx.prompt]
  }));

fs.writeFileSync('content/materi/queue-kelas1-3.json', `${JSON.stringify(queue, null, 2)}\n`);
const counts = {};
for (const item of queue) counts[item.grade] = (counts[item.grade] ?? 0) + 1;
console.log('queue entries', queue.length, counts);
console.log('first', queue[0]?.id, '|', queue[0]?.title);
