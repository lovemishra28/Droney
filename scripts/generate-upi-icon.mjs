import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

function createCrc32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCrc32Table();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, "ascii");
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePng(width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdrChunk = makeChunk("IHDR", ihdrData);

  // Raw image data with scanline filter bytes
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Draw a neat UPI-style rounded square badge with orange/green split chevron
      const cx = width / 2;
      const cy = height / 2;
      const distFromCenter = Math.max(Math.abs(x - cx), Math.abs(y - cy));

      if (distFromCenter < 28) {
        // Badge background: dark slate/white rounded
        if (x < width * 0.45 && y > height * 0.25 && y < height * 0.75) {
          // Orange chevron (UPI orange: #097939 / #F37021)
          rawData[pixelOffset] = 0xf3; // R
          rawData[pixelOffset + 1] = 0x70; // G
          rawData[pixelOffset + 2] = 0x21; // B
          rawData[pixelOffset + 3] = 0xff; // A
        } else if (x >= width * 0.45 && y > height * 0.25 && y < height * 0.75) {
          // Green chevron (UPI green: #097939)
          rawData[pixelOffset] = 0x09;
          rawData[pixelOffset + 1] = 0x79;
          rawData[pixelOffset + 2] = 0x39;
          rawData[pixelOffset + 3] = 0xff;
        } else {
          rawData[pixelOffset] = 0xff;
          rawData[pixelOffset + 1] = 0xff;
          rawData[pixelOffset + 2] = 0xff;
          rawData[pixelOffset + 3] = 0xff;
        }
      } else {
        // Transparent outer
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
      }
    }
  }

  const idatCompressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk("IDAT", idatCompressed);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const png = generatePng(64, 64);
const targetPath = path.resolve("./public/brand/upi-icon.png");
fs.writeFileSync(targetPath, png);
console.log(`Generated ${targetPath} (${png.length} bytes)`);
