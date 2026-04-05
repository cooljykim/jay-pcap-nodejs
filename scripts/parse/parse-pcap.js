import fs from 'fs';

const filePath = 'scripts/parse/anonymized-spi.nf5';
const outputPath = 'scripts/parse/flows.json';

const buffer = fs.readFileSync(filePath);
let offset = 0;

const flows = [];

// NetFlow v5 header: 24 bytes
while (offset < buffer.length) {
  if (offset + 24 > buffer.length) break;

  const version = buffer.readUInt16BE(offset);
  const count = buffer.readUInt16BE(offset + 2);
  const uptime = buffer.readUInt32BE(offset + 4);
  const seconds = buffer.readUInt32BE(offset + 8);
  const nseconds = buffer.readUInt32BE(offset + 12);
  const flowSequence = buffer.readUInt32BE(offset + 16);
  const engineType = buffer.readUInt8(offset + 20);
  const engineId = buffer.readUInt8(offset + 21);
  const sampling = buffer.readUInt16BE(offset + 22);

  offset += 24;

  for (let i = 0; i < count; i++) {
    if (offset + 48 > buffer.length) break;

    const srcaddr = `${buffer.readUInt8(offset)}.${buffer.readUInt8(offset + 1)}.${buffer.readUInt8(offset + 2)}.${buffer.readUInt8(offset + 3)}`;
    const dstaddr = `${buffer.readUInt8(offset + 4)}.${buffer.readUInt8(offset + 5)}.${buffer.readUInt8(offset + 6)}.${buffer.readUInt8(offset + 7)}`;
    const nexthop = `${buffer.readUInt8(offset + 8)}.${buffer.readUInt8(offset + 9)}.${buffer.readUInt8(offset + 10)}.${buffer.readUInt8(offset + 11)}`;
    const input = buffer.readUInt16BE(offset + 12);
    const output = buffer.readUInt16BE(offset + 14);
    const dPkts = buffer.readUInt32BE(offset + 16);
    const dOctets = buffer.readUInt32BE(offset + 20);
    const first = buffer.readUInt32BE(offset + 24);
    const last = buffer.readUInt32BE(offset + 28);
    const srcport = buffer.readUInt16BE(offset + 32);
    const dstport = buffer.readUInt16BE(offset + 34);
    const tcpFlags = buffer.readUInt8(offset + 37);
    const prot = buffer.readUInt8(offset + 38);
    const tos = buffer.readUInt8(offset + 39);
    const srcAs = buffer.readUInt16BE(offset + 40);
    const dstAs = buffer.readUInt16BE(offset + 42);
    const srcMask = buffer.readUInt8(offset + 44);
    const dstMask = buffer.readUInt8(offset + 45);

    const flow = {
      srcaddr,
      dstaddr,
      nexthop,
      input,
      output,
      dPkts,
      dOctets,
      first,
      last,
      srcport,
      dstport,
      tcpFlags,
      prot,
      tos,
      srcAs,
      dstAs,
      srcMask,
      dstMask,
    };

    flows.push(flow);
    offset += 48;
  }
}

fs.writeFileSync(outputPath, JSON.stringify(flows, null, 2));
console.log(`Parsed ${flows.length} flows and saved to ${outputPath}`);
