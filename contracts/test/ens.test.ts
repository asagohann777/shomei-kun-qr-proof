// SPDX-License-Identifier: MIT
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { confirmEnsRecipient, createEnsResolver, EnsError, normalizeEnsName, recheckEnsRecipient } from '../cli/ens';
const first = {name:'shomeikun.eth', address:'0x2222222222222222222222222222222222222222', chainId:11155111 as const};
test('ENS names normalize and invalid input fails before network access', () => {
  assert.equal(normalizeEnsName('SHOMEIKUN.eth'), 'shomeikun.eth');
  for (const name of ['', 'name', ' name.eth', 'a..eth']) assert.throws(() => normalizeEnsName(name), EnsError);
  assert.throws(() => createEnsResolver(undefined), /ENS_NOT_CONFIGURED/);
});
test('recipient must pass EOA check and explicit confirmation', async () => {
  const calls: string[] = [];
  const input = {name:'SHOMEIKUN.eth', resolve:async(name:string)=>{calls.push(name);return first;}, requireEoa:async()=>{calls.push('eoa');}, confirm:async()=>{calls.push('confirm');return true;}};
  assert.deepEqual(await confirmEnsRecipient(input), first);
  assert.deepEqual(calls,['shomeikun.eth','eoa','confirm']);
  await assert.rejects(confirmEnsRecipient({...input,confirm:async()=>false}), /not confirmed/);
  await assert.rejects(confirmEnsRecipient({...input,requireEoa:async()=>{throw new Error('contract');}}), /contract/);
});
test('changed address blocks signing while unchanged recipient passes', async () => {
  await recheckEnsRecipient(first, async()=>first);
  await assert.rejects(recheckEnsRecipient(first,async()=>({...first,address:'0x3333333333333333333333333333333333333333'})), /ENS_ADDRESS_CHANGED/);
});
test('primary names require forward confirmation and all failures fall back to address', async()=>{
  const { verifiedPrimaryName } = await import('../cli/ens');
  assert.equal(await verifiedPrimaryName(first.address,async()=>first.name,async()=>first.address),first.name);
  assert.equal(await verifiedPrimaryName(first.address,async()=>first.name,async()=> '0x3333333333333333333333333333333333333333'),null);
  assert.equal(await verifiedPrimaryName(first.address,async()=>null,async()=>{throw new Error('must not resolve');}),null);
  assert.equal(await verifiedPrimaryName(first.address,async()=>{throw new Error('offline');},async()=>first.address),null);
});
test('edge-compatible fetch rejects redirects instead of following them', async(t)=>{
  t.mock.method(globalThis,'fetch',async(_url,options)=>{
    assert.equal(options?.redirect,'manual');
    return new Response(null,{status:302,headers:{Location:'https://other.example'}});
  });
  const resolver=createEnsResolver('https://rpc.example');
  try {await assert.rejects(resolver.resolve('shomeikun.eth'),/ENS_UNAVAILABLE/);}finally{resolver.destroy();}
});
