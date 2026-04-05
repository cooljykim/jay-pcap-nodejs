import fs from 'fs';
import pcapParser from 'pcap-parser';

// Input .nf5/pcap file and output json file
const inputFile = 'scripts/spi.nf5';
const outputFile = 'scripts/parse-3/output.json';

// Create a readable stream from the pcap file
const parser = pcapParser.parse(fs.createReadStream(inputFile));

const packets = [];

// Event: Fired after parsing each packet's data
parser.on('packet', (packet) => {
  // packet.header contains header info, packet.data is the raw packet
  packets.push({
    header: packet.header,
    // Convert buffer data to hex string for JSON readability
    data: packet.data.toString('hex'),
  });
});

// Event: Emitted after all packets are parsed
parser.on('end', () => {
  fs.writeFileSync(outputFile, JSON.stringify(packets, null, 2));
  console.log(
    `Successfully converted ${packets.length} packets to ${outputFile}`,
  );
});

// Handle errors
parser.on('error', (err) => {
  console.error('Error parsing pcap:', err);
});
