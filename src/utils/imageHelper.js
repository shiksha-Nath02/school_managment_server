const path = require('path');
const fs = require('fs');

function saveBase64Image(base64Data, filename) {
  const dir = path.join(__dirname, '../../uploads/attendance');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const data = base64Data.replace(/^data:image\/\w+;base64,/, '');
  fs.writeFileSync(path.join(dir, filename), Buffer.from(data, 'base64'));
  return `uploads/attendance/${filename}`;
}

module.exports = { saveBase64Image };
