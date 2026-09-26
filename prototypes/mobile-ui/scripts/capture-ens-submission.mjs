// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const base='https://shomei-kun-integration.dptr.workers.dev/ui/';
const output='../../docs/submission/2026-09-26/screenshots';
const browser=await chromium.launch();
const errors=[],captures=[];
try {
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,locale:'en-US',isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 page.on('pageerror',error=>errors.push(error.message));
 async function capture(file,description){
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>[...document.images].every(image=>image.complete&&image.naturalWidth>0));
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`${output}/${file}`,fullPage:true});
  captures.push({file,description,source:page.url(),mode:'live API and real registered records; no wallet signing'});
 }
 await page.goto(base);await page.locator('[data-action="ens-open"]').click();
 await page.locator('#ens-name').fill('shomeikun.eth');
 await capture('10-ens-search-en.png','ENS name or wallet address input');
 await page.locator('#ens-form button').click();await page.locator('[data-card-id="test-20260926-002"]').waitFor({timeout:45000});
 await capture('11-ens-results-en.png','Actual registrations returned for shomeikun.eth');
 await page.locator('[data-card-id="test-20260926-002"]').click();await page.locator('[data-action="details"]').waitFor({timeout:30000});
 await capture('12-live-record-en.png','Actual registered owner and card record');
 assert.deepEqual(errors,[]);
 await writeFile(`${output}/capture-live-ens.json`,JSON.stringify({capturedAt:new Date().toISOString(),base,browser:browser.version(),viewport:{width:390,height:844},deviceScaleFactor:2,locale:'en-US',captures,errors},null,2)+'\n');
 console.log(JSON.stringify({captures:captures.length,errors}));
}finally{await browser.close();}
