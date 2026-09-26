const fs = require('node:fs');
const artifact = require('../artifacts/src/OwnershipRegistry.sol/OwnershipRegistry.json');
const output = JSON.stringify({ contractName: artifact.contractName, compiler: '0.8.30', evmVersion: 'paris', abi: artifact.abi, bytecode: artifact.bytecode, deployedBytecode: artifact.deployedBytecode }, null, 2) + '\n';
const file = 'abi/OwnershipRegistry.json';
if (process.argv.includes('--check')) {
  if (fs.readFileSync(file, 'utf8') !== output) throw new Error('ABI artifact differs; run npm run compile');
} else fs.writeFileSync(file, output);
