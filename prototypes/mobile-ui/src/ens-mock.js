// SPDX-License-Identifier: MIT
// UI fixtures only. These records do not represent an ENS lookup or registration.
export const mockEnsApi = {
  async ensCards(value, cursor) {
    await new Promise(resolve => setTimeout(resolve, 350));
    const name = value.trim().toLowerCase();
    const direct = /^0x[0-9a-f]{40}$/.test(name);
    const fail = code => { throw Object.assign(new Error(code), { code }); };
    if (!direct && !/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(name)) fail('ENS_INVALID_NAME');
    if (name === 'error.eth') fail('ENS_UNAVAILABLE');
    if (!direct && name !== 'shomeikun.eth' && name !== 'empty.eth') fail('ENS_NOT_FOUND');
    const complete = name === 'empty.eth' || Boolean(cursor);
    const owner = { address: direct ? name : '0x7A31000000000000000000000000000000008f42', nickname: 'おじいちゃんコンビニ' };
    const ids = name === 'empty.eth' ? [] : cursor ? ['TC-003'] : ['TC-001', 'TC-002'];
    return { name, address: owner.address, ensChainId: direct ? null : 11155111,
      registry: { chainId: 2017072401, contractAddress: '0x1111111111111111111111111111111111111111', issuer: owner.address },
      snapshot: { number: 100, hash: `0x${'11'.repeat(32)}` },
      cards: ids.map((cardId, i) => ({ cardId, owner, transactionHash: `0x${String(i + 1).repeat(64)}`, blockNumber: 100 - i })),
      complete, nextCursor: complete ? null : 'sample-page-2' };
  },
};
