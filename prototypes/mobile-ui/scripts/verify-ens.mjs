// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
const server=createServer(async(req,res)=>{
  try { const path=new URL(req.url,'http://local').pathname; if(path.includes('..')) throw new Error();
    const data=await readFile(`dist-integration${path==='/'?'/index.html':path}`);
    res.setHeader('Content-Type',path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.svg')?'image/svg+xml':path.endsWith('.jpg')?'image/jpeg':'text/html');res.end(data);
  } catch {res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(4179,'127.0.0.1',resolve));
try {
for(const engine of [chromium,webkit]) {
 const browser=await engine.launch();
 try {
 const page=await browser.newPage({viewport:{width:390,height:844},locale:'en-US'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const address=`0x${'22'.repeat(20)}`;const hash=`0x${'44'.repeat(32)}`;
 let mode='partial';
 await page.route('**/api/v1/ens/cards?*',route=>{
  const data={name:'shomeikun.eth',address,ensChainId:11155111,registry:{chainId:2017,contractAddress:address,issuer:address},snapshot:{number:100,hash},cards:[],complete:mode!=='partial',nextCursor:mode==='partial'?'next':null};
  if(mode==='card') data.cards=[{cardId:'existing-card',owner:{address,nickname:'Owner'},transactionHash:hash,blockNumber:100}];
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({meta:{mode:'live'},data})});
 });
 await page.route('**/api/v1/cards/*',route=>route.fulfill({status:404,contentType:'application/json',body:JSON.stringify({meta:{mode:'live'},error:{code:'CARD_NOT_FOUND',message:'Not found'}})}));
 await page.goto('http://127.0.0.1:4179/');
 await page.locator('[data-action="ens-open"]').click();
 await page.locator('#ens-name').fill('shomeikun.eth');await page.locator('#ens-form button').click();
 await page.locator('[data-action="ens-more"]').waitFor();
 assert.equal(await page.getByText('No cards are registered to this wallet.').count(),0);
 mode='empty';await page.locator('[data-action="ens-more"]').click();await page.getByText('No cards are registered to this wallet.').waitFor();
 await page.setViewportSize({width:320,height:700});
 mode='card';await page.locator('#ens-form button').click();await page.locator('[data-action="ens-card"]').waitFor();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('[data-action="ens-card"]').click();await page.waitForURL('**/?cardId=existing-card');
 await page.goto('http://127.0.0.1:4179/');await page.locator('[data-action="open-camera"]').waitFor();
 await page.locator('[data-action="scenarios"]').click();await page.locator('[data-action="language"]').click();await page.keyboard.press('Escape');
 await page.locator('[data-action="ens-open"]').click();await page.getByRole('heading',{name:'ENS名・アドレスで探す'}).waitFor();
 await page.locator('#ens-name').fill('\"><img src=x onerror=alert(1)>');await page.locator('#ens-form button').click();await page.locator('[data-action="ens-card"]').waitFor();assert.equal(await page.locator('#ens-form img').count(),0);
 assert.deepEqual(errors,[]);console.log(`${engine.name()}: ENS search, partial/empty state, existing detail navigation and QR entry passed`);
 } finally {await browser.close();}
}
} finally {server.close();}
