const { subtask } = require('hardhat/config');
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require('hardhat/builtin-tasks/task-names');
subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD).setAction(async ({ solcVersion }) => {
  if (solcVersion !== '0.8.30') throw new Error('Unexpected compiler');
  return { compilerPath: require.resolve('solc/soljson.js'), isSolcJs: true, version: solcVersion, longVersion: require('solc').version() };
});
module.exports = { solidity: { version: '0.8.30', settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: 'paris' } }, paths: { sources: './src' } };
