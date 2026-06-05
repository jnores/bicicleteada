const fs = require('fs');
const lines = fs.readFileSync('INSITUCIONES.TXT', 'utf8').split('\n');

const results = [];
for (const line of lines) {
  if (!line.trim() || line.startsWith('Necesito') || line.startsWith('{ name:')) continue;
  
  // Format from user: { coord: [lat, lng], color: '#color' name: 'text...'}
  // Let's use regex to extract the parts
  const match = line.match(/\{ coord: \[(.*?),\s*(.*?)\], color: '(.*?)' name: '(.*?)'\}/);
  if (match) {
    const lat = match[1];
    const lng = match[2];
    const color = match[3];
    const rawName = match[4].replace(/\t/g, ' ').trim();
    // remove multiple spaces
    const name = rawName.replace(/\s+/g, ' ');
    results.push(`  { name: '${name.replace(/'/g, "\\'")}', color: '${color}', coords: [${lat}, ${lng}] },`);
  }
}

const content = "\nexport const INSTITUCIONES = [\n" + results.join('\n') + "\n];\n";
fs.appendFileSync('lib/circuits.js', content);
console.log("Appended to lib/circuits.js successfully.");
