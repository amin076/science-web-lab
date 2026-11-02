import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
import {GENERIC_SIMULATION_WIDGET_HTML} from '../functions/mcp/simulationWidget.mjs';
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
try {
  const page = await browser.newPage();
  await page.goto(process.env.ESBIKO_AUDIT_URL || 'http://127.0.0.1:5174');
  const search = page.getByRole('textbox',{name:'Search simulations',exact:true});
  await search.fill('pendulum');
  assert.equal(new URL(page.url()).pathname,'/');
  await search.press('Enter');
  await page.waitForURL('**/experiments?q=pendulum');
  await page.getByRole('textbox',{name:'Search experiments',exact:true}).waitFor();
  assert.equal(await page.getByRole('textbox',{name:'Search experiments',exact:true}).inputValue(),'pendulum');
  await page.getByRole('textbox',{name:'Search experiments',exact:true}).fill('zzzz-no-simulation');
  await page.getByRole('status').filter({hasText:'No simulations found'}).waitFor();
  await page.reload();
  assert.equal(await page.getByRole('textbox',{name:'Search experiments',exact:true}).inputValue(),'zzzz-no-simulation');
  fs.mkdirSync('artifacts/platform-audit',{recursive:true});
  await page.setViewportSize({width:360,height:800});
  await page.screenshot({path:'artifacts/platform-audit/search-mobile.png',fullPage:true});
  for (const width of [360,600,1280]) {
    await page.setViewportSize({width,height:720});
    await page.setContent(GENERIC_SIMULATION_WIDGET_HTML);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'Widget overflow at '+width);
    assert.equal(await page.locator('#level').innerText(),'Interactive lab');
  }
  console.log('Discovery UI PASS: typing, submit, URL persistence, empty results, widget 360/600/1280px');
} finally {await browser.close();}
