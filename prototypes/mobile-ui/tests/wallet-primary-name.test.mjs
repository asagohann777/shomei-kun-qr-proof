// SPDX-License-Identifier: MIT
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWalletPrimaryName} from '../src/wallet-primary-name.js';
test('wallet changes immediately remove old name and ignore stale responses',async()=>{
 const pending=new Map();const c=createWalletPrimaryName({primaryName:address=>new Promise(resolve=>pending.set(address,resolve))},()=>{});
 const a=c.setAddress('0xaaa');pending.get('0xaaa')({address:'0xaaa',name:'alice.eth'});await a;
 assert.equal(c.snapshot().name,'alice.eth');const b=c.setAddress('0xbbb');assert.equal(c.snapshot().name,null);
 const d=c.setAddress('0xccc');pending.get('0xbbb')({address:'0xbbb',name:'bob.eth'});await b;assert.equal(c.snapshot().name,null);
 pending.get('0xccc')({address:'0xccc',name:'carol.eth'});await d;assert.equal(c.snapshot().name,'carol.eth');await c.setAddress(null);assert.deepEqual(c.snapshot(),{address:null,name:null});
});
test('failure and absent primary name retain address without throwing',async()=>{
 for(const primaryName of [async address=>({address,name:null}),async()=>{throw new Error('offline');}]) {
  const c=createWalletPrimaryName({primaryName},()=>{});await c.setAddress('0xabc');assert.deepEqual(c.snapshot(),{address:'0xabc',name:null});
 }
});
