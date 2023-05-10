const dns2 = require('dns2');
require('dotenv').config();

const { Packet, UDPClient } = dns2;

async function resolvedns(name) {
  const resolve = UDPClient({
    dns : '1.1.1.1',
    port: 53
  });
  return await resolve(name);
}

const server = dns2.createServer({
  udp: true,
  handle: (request, send, rinfo) => {
    const [ question ] = request.questions;
    const { name } = question;
    const response = Packet.createResponseFromRequest(request);
    resolvedns(name).then( temp => {
      response.answers.push({
        name: temp.answers[0].name,
        type: temp.answers[0].type,
        class: temp.answers[0].class,
        ttl: temp.answers[0].ttl,
        address: temp.answers[0].address
      });
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
