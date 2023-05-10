const dns2 = require('dns2');
require('dotenv').config();

const { Packet } = dns2;

async function resolvedns(name) {
  const option = {
    dns : '1.1.1.1',
    port: 53
  };

  const dns = new dns2(option);

  const a = await dns.resolveA(name);
  const cname = await dns.resolveCNAME(name);

  const dns_list = [];
  dns_list.push(a);
  dns_list.push(cname);
  return dns_list
}

const server = dns2.createServer({
  udp: true,
  handle: (request, send, rinfo) => {
    const [ question ] = request.questions;
    const { name } = question;
    const response = Packet.createResponseFromRequest(request);
    resolvedns(name).then( dns => {
      console.log(dns);
      let dnsa = dns[0].answers;
      for (let i = 0; i < dnsa.length; i++) {
        response.answers.push({
          name: dnsa[i].name,
          type: dnsa[i].type,
          class: dnsa[i].class,
          ttl: dnsa[i].ttl,
          address: dnsa[i].address
        });
      }
      send(response);
    });
  }
});

server.on('request', (request, response, rinfo) => {
  console.log(request.header.id, request.questions[0]);
});

server.on('requestError', (error) => {
  console.log('Client sent an invalid request', error);
});

server.on('listening', () => {
  console.log(server.addresses());
});

server.on('close', () => {
  console.log('server closed');
});

server.listen({
  udp: { 
    port: process.env.SERVER_PORT,
    address: process.env.SERVER_IP, // ip internal of vm (from either IP a or ipconfig)
    type: "udp4",  // IPv4 or IPv6 (Must be either "udp4" or "udp6")
  },
  
  tcp: { 
    port: process.env.SERVER_PORT,
    address: process.env.SERVER_IP, // ip internal of vm (from either IP a or ipconfig)
  },
});

// eventually
//server.close();
