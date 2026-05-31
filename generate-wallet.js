const { Keypair } = require('@solana/web3.js');

const keypair = Keypair.generate();
const publicKey = keypair.publicKey.toBase58();
const privateKey = Buffer.from(keypair.secretKey).toString('hex');

console.log('\n=== VØID WALLET ===');
console.log('PUBLIC KEY (put in .env.local):', publicKey);
console.log('PRIVATE KEY (save somewhere safe):', privateKey);
console.log('\nDelete this file after running it.\n');
