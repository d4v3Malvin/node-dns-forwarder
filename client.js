const { UDPClient } = require('dns2');
require('dotenv').config();

const resolve = UDPClient({
  dns : process.env.SERVER_IP,
  port: process.env.SERVER_PORT
});

(async () => {
  const response = await resolve('google.com')
  console.log(response.answers);
})();