import { Actor, log } from 'apify';
import { chromium } from 'playwright';
await Actor.init();
let browser; let healthy=false;
let output={purpose:'One ordinary browser navigation in the actual Apify cloud runtime',login:false,proxy:false,stealth:false,challengeSolved:false,customHeaders:false};
const sourceUrl='https://www.linkedin.com/ad-library/job/search?keyword=software+engineer&countries=DE';
try {
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext();
 const page=await context.newPage();
 const response=await page.goto(sourceUrl,{waitUntil:'domcontentloaded',timeout:45000});
 const httpStatus=response?.status()??null;
 let text=await page.locator('body').innerText();
 const blocked=/(sorry[, ]+you have been blocked|verify you are human|verify you.re human|captcha|access denied|security verification|security challenge|robot verification)/i.test(text);
 if(httpStatus===200&&!blocked){
  try{await page.waitForSelector('a[href*="/ad-library/job/detail/"]',{timeout:8000});}catch{}
  text=await page.locator('body').innerText();
 }
 const links=await page.locator('a[href*="/ad-library/job/detail/"]').evaluateAll(anchors=>[...new Set(anchors.map(a=>a.href))]);
 const detailUrls=links.filter(value=>/^https:\/\/www\.linkedin\.com\/ad-library\/job\/detail\/\d+$/.test(value));
 healthy=httpStatus===200&&!blocked&&detailUrls.length>0;
 output={...output,sourceUrl,observedAt:new Date().toISOString(),pageNavigations:1,httpStatus,title:await page.title(),challengeOrBlockObserved:blocked,detailLinkCount:detailUrls.length,detailUrls:detailUrls.slice(0,24),visibleTextPreview:text.slice(0,1200),automaticSearchLinksVerified:healthy,fullCollectionVerified:false,commercialReady:false};
} catch {
 output={...output,sourceUrl,observedAt:new Date().toISOString(),pageNavigations:1,errorCode:'NORMAL_BROWSER_NAVIGATION_FAILED',automaticSearchLinksVerified:false,fullCollectionVerified:false,commercialReady:false};
} finally {
 if(browser)await browser.close();
}
await Actor.setValue('OUTPUT',output);
log.info('Ordinary cloud source preflight',{httpStatus:output.httpStatus??null,detailLinkCount:output.detailLinkCount??0,automaticSearchLinksVerified:healthy});
if(!healthy)await Actor.fail('Ordinary source access was not established. No bypass or further source attempt.');
await Actor.exit();
