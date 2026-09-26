// SPDX-License-Identifier: MIT
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchEnsCards, type SearchGateway } from '../src/backend/ens-search';
const address = `0x${'22'.repeat(20)}`;
const hash = `0x${'44'.repeat(32)}`;
const resolve = async () => ({name:'test.eth',address,chainId:11155111 as const});
function gateway(head=9000): SearchGateway {
  return {mode:'live',registry:{chainId:2017,contractAddress:`0x${'11'.repeat(20)}`,issuer:address},deploymentBlock:1,
    searchBlock:async(number=head)=>({number,hash}),registrationLogs:async()=>[],
    readCard:async()=>{throw new Error('unexpected');},getTransaction:async()=>null,getReceipt:async()=>null,
    findRegistrationEvent:async()=>null,buildRegistrationTransaction:async()=>{throw new Error('unexpected');}};
}
test('bounded empty pages remain partial until all ranges have been scanned',async()=>{
  const port=gateway(); const ranges:number[][]=[];
  port.registrationLogs=async(owner,from,to)=>{assert.equal(owner,address);ranges.push([from,to]);return [];};
  const first=await searchEnsCards({name:'test.eth',resolve,gateway:port});
  assert.equal(first.complete,false); assert.ok(first.nextCursor); assert.deepEqual(first.cards,[]);
  assert.deepEqual(ranges,[[7001,9000],[5001,7000],[3001,5000],[1001,3000]]);
  const last=await searchEnsCards({name:'test.eth',cursor:first.nextCursor,resolve,gateway:port});
  assert.equal(last.complete,true);assert.equal(last.nextCursor,null);
  assert.deepEqual(ranges.at(-1),[1,1000]);
});
test('cursor rejects changed ENS address, reorg and malformed input',async()=>{
  const port=gateway();const first=await searchEnsCards({name:'test.eth',resolve,gateway:port});
  assert.ok(first.nextCursor);
  await assert.rejects(searchEnsCards({name:'test.eth',cursor:first.nextCursor,resolve:async()=>({...await resolve(),address:`0x${'33'.repeat(20)}`}),gateway:port}),/ENS address changed/);
  port.searchBlock=async(number=9000)=>({number,hash:`0x${'55'.repeat(32)}`});
  await assert.rejects(searchEnsCards({name:'test.eth',cursor:first.nextCursor,resolve,gateway:port}),/Start a new search/);
  await assert.rejects(searchEnsCards({name:'test.eth',cursor:'garbage',resolve,gateway:port}),/Invalid cursor/);
});
test('verified records paginate within one block and reject mismatched receipts',async()=>{
  const port=gateway(100);
  const contract=port.registry.contractAddress;
  const records=Array.from({length:21},(_,i)=>({cardId:`card-${i}`,owner:address,nickname:'owner',blockNumber:100,logIndex:i,transactionHash:`0x${i.toString(16).padStart(64,'0')}`,blockHash:hash}));
  port.registrationLogs=async()=>records;
  port.readCard=async(cardId)=>({kind:'registered',cardId,playerName:'証明一郎',allowedWallet:address,owner:{address,nickname:'owner'}});
  port.getTransaction=async(tx)=>({hash:tx,chainId:port.registry.chainId,from:address,to:contract,pending:false,registration:{cardId:records.find(r=>r.transactionHash===tx)!.cardId,nickname:'owner'}});
  port.getReceipt=async(tx)=>({transactionHash:tx,status:'success',blockNumber:100,canonical:true,events:[{...records.find(r=>r.transactionHash===tx)!,emitter:contract}]});
  const first=await searchEnsCards({name:'test.eth',resolve,gateway:port});
  assert.equal(first.cards.length,20);assert.equal(first.cards[0]?.cardId,'card-20');assert.equal(first.complete,false);assert.ok(first.nextCursor);
  const last=await searchEnsCards({name:'test.eth',cursor:first.nextCursor,resolve,gateway:port});
  assert.deepEqual(last.cards.map(c=>c.cardId),['card-0']);assert.equal(last.complete,true);
  port.getReceipt=async()=>null;
  await assert.rejects(searchEnsCards({name:'test.eth',resolve,gateway:port}),/Cannot verify registration/);
});
test('direct address lookup skips ENS and scans registration events',async()=>{
 const port=gateway(100);
 const result=await searchEnsCards({name:address,resolve:async()=>{throw new Error('ENS must not be called');},gateway:port});
 assert.equal(result.address.toLowerCase(),address);assert.equal(result.ensChainId,null);assert.equal(result.complete,true);
 await assert.rejects(searchEnsCards({name:'0x123',resolve,gateway:port}),/Invalid wallet address/);
});
