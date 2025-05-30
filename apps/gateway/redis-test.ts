import { createClient } from 'redis';

async function testRedis() {
  const client = createClient({
    socket: {
      host: 'redis-14020.c327.europe-west1-2.gce.redns.redis-cloud.com',
      port: 14020,
    },
    password: 'XXlqBPEUADtDUkCm7AmJzgUe6B3OhhsU',
  });

  client.on('error', (err) => console.log('Redis Client Error', err));
  await client.connect();

  await client.set('ping', 'pong', { EX: 6000 });
  const val = await client.get('ping');
  console.log('ping =', val);

  await client.disconnect();
}

testRedis();
