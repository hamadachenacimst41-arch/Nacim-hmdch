const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([len, typeAndData, crc]);
}

function generateIcon(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image scanlines
  // Colors: Dark Slate: 15, 23, 42 (0x0F, 0x17, 0x2A); Amber: 245, 158, 11 (0xF5, 0x9E, 0x0B); White: 255, 255, 255
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = isMaskable ? width * 0.38 : width * 0.44;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background is dark navy: #0f172a
      let r = 15, g = 23, b = 42, a = 255;

      // Inner rounded badge / shield in Amber: #f59e0b
      if (dist < radius) {
        r = 245; g = 158; b = 11; a = 255;

        // Inner GCB emblem area in dark slate
        const boxSize = radius * 0.65;
        if (Math.abs(dx) < boxSize && Math.abs(dy) < boxSize * 0.5) {
          r = 15; g = 23; b = 42; a = 255;
        }

        // Accent gold highlight ring
        if (Math.abs(dist - radius + 3) < 2) {
          r = 251; g = 191; b = 36; a = 255;
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 192x192
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generateIcon(192, 192, false));
console.log('Created pwa-192x192.png');

// 512x512
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generateIcon(512, 512, false));
console.log('Created pwa-512x512.png');

// 512x512 maskable (with safe zone)
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generateIcon(512, 512, true));
console.log('Created pwa-maskable-512x512.png');

// apple-touch-icon 180x180
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generateIcon(180, 180, false));
console.log('Created apple-touch-icon.png');
