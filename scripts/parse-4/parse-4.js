import pcapParser from 'pcap-parser';
import cap from 'cap';
import fs from 'fs';

function parsePCAP() {
  const output = [];

  const pcapFilePath = 'scripts/spi.nf5';

  const parser = pcapParser.parse(pcapFilePath);
  const { decoders } = cap;

  parser.on('packet', (packet) => {
    const timestamp = new Date(
      packet.header.timestampSeconds * 1000 +
        packet.header.timestampMicroseconds / 1000,
    );

    const data = packet.data;

    try {
      const eth = decoders.Ethernet(data);
      if (eth.ethertype === 2048) {
        // IPv4
        const ip = decoders.IPV4(data, 14); // Ethernet header is 14 bytes
        let protocol = 'IP';
        let srcPort;
        let dstPort;

        if (ip.protocol === 6) {
          // TCP
          const tcp = decoders.TCP(data, 14 + ip.headerLength);
          srcPort = tcp.srcPort;
          dstPort = tcp.dstPort;
          protocol = 'TCP';
        } else if (ip.protocol === 17) {
          // UDP
          const udp = decoders.UDP(data, 14 + ip.headerLength);
          srcPort = udp.srcPort;
          dstPort = udp.dstPort;
          protocol = 'UDP';
        }

        output.push({
          timestamp,
          src_ip: ip.src,
          dst_ip: ip.dst,
          src_port: srcPort,
          dst_port: dstPort,
          protocol,
          packet_length: packet.header.originalLength,
        });
      }
    } catch (e) {
      // Skip packets that can't be decoded
      console.warn('Skipping packets that cannot be decoded:', e);
    }
  });

  parser.on('end', () => {
    const outputFile = 'scripts/parse-4/output.json';
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log('PCAP parsing complete');
  });

  parser.on('error', (err) => {
    console.error('Error parsing PCAP:', err);
  });
}

parsePCAP();
