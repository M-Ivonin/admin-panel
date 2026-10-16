const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const out = process.env.OVERVIEW_PROOF_OUT || __dirname;
fs.mkdirSync(out, { recursive: true });
const base = process.env.OVERVIEW_PROOF_URL || 'http://127.0.0.1:3146';
const days = Array.from({length:7},(_,i)=>`2026-10-${String(10+i).padStart(2,'0')}`);
const moneyValues = [380,399.2,370,400,418.4,450,428.6];
const point = (date, amount) => ({date, netGrossAmountUsd:amount.toFixed(2), positiveGrossAmountUsd:amount.toFixed(2), negativeGrossAmountUsd:'0.00',positiveCount:18,negativeCount:0});
const usd = (amount) => ({ baseCurrency:'USD',netGrossAmountUsd:amount.toFixed(2),positiveGrossAmountUsd:amount.toFixed(2),negativeGrossAmountUsd:'0.00',rateDate:'2026-10-16',source:'proof fixture',sourceUrl:'https://example.invalid',missingCurrencies:[] });
const summary = (amount, weekly=false) => ({ totalEntries:18,recordedPositiveCount:18,recordedNegativeCount:0,skippedCount:0,missingAmountCount:0,byCurrency:[],usdRevenue:usd(amount),dailyUsdRevenue:weekly?days.map((day,i)=>point(day,moneyValues[i])):[point('2026-10-16',amount)],storeAdjustedRevenue:{...usd(amount),grossAmountUsd:amount.toFixed(2),estimatedStoreCommissionUsd:(amount*.15).toFixed(2),estimatedNetAmountUsd:(amount*.85).toFixed(2),commissionSchedule:[]},dailyStoreAdjustedRevenue:days.map((date,i)=>({date,grossAmountUsd:String(moneyValues[i]),estimatedNetAmountUsd:(moneyValues[i]*.85).toFixed(2),estimatedStoreCommissionUsd:(moneyValues[i]*.15).toFixed(2)})) });
const metric = { total:50,evaluated:38,correct:26,accuracy:68.4,pending:12,notFound:0,unsupported:0,failed:0,fixtureCount:6,predictionCount:50,safe:{evaluated:20,correct:15,accuracy:75,averageOdds:1.8},risky:{evaluated:18,correct:11,accuracy:61.1,averageOdds:2.1} };
const events = { summary:{totalEvents:2000,uniqueUsers:600,screenOpenUniqueUsers:510,businessActionEvents:1248}, countsByEvent:[{eventKey:'chat_in_ai_chat',count:520},{eventKey:'ai_chat_prediction_voted',count:340},{eventKey:'checkout_started',count:92},{eventKey:'live_challenge_invite_accepted',count:64},{eventKey:'matches_screen_opened',count:752},{eventKey:'public_channel_message_sent',count:232}], metadata:{timezone:'UTC',releaseDate:'2026-10-01',noBackfill:true,noBackfillMessage:'No backfill',defaultRangeDays:14,maxRangeDays:90},range:{from:'2026-10-16T00:00Z',to:'2026-10-16T14:30Z'},timeSeries:[],dailyTimeSeries:[],heatmapUtc:[],filters:{targetApps:[],platforms:[],appVersions:[],locales:[],sourceTypes:[],categories:[],eventKeys:[]},versionHealth:[],recentEvents:[],nextCursor:null,emptyState:null };
const growth = { date:'2026-10-16',cutoff:'2026-10-16T14:30:00.000Z',partial:true,registrations:{today:128,previous:108,daily:days.map((date,i)=>({date,value:[60,92,56,82,103,115,128][i]}))},subscriptions:{today:18,previous:16,daily:days.map((date,i)=>({date,value:[10,16,12,15,18,17,18][i]}))} };
const marketing = { campaigns:{sent:1840,opened:126,openRate:126/1840},email:{delivered:2410,clicked:84,clickRate:84/2410},deliveryFailures:1 };
const monitoring = {generatedAt:'2026-10-16T14:30:00Z',environment:'proof',workerHeartbeatAt:'2026-10-16T14:30:00Z',checks:Array.from({length:12},(_,i)=>({checkId:`${i<5?'backend':i<7?'n8n':'sportmonks'}.check${i}`,required:true,enabled:true,intervalMs:60000,deadlineMs:10000,status:'pass',lastRun:{runId:String(i),endedAt:'2026-10-16T14:29:59Z',outcome:'pass'}})),delivery:{slackPending:0,slackFailed:0,lokiPending:0,lokiDropped:0}};
const scenarios = process.env.OVERVIEW_SCENARIOS?.split(',') || ['healthy','partial-error','empty','locked','monitor-stale','monitor-fail','loading'];
(async()=>{
 const browser = await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath:process.env.PLAYWRIGHT_CHROMIUM_PATH } : {})});
 const results=[];
 try {
 for (const scenario of scenarios) {
   const context=await browser.newContext({viewport:{width:1536,height:1024},deviceScaleFactor:1});
   const email=scenario==='revenue-hidden'?'dmytro.vybornov@levantem.ai':scenario==='revenue-mykhailo'?'mykhailo@levantem.ai':'sergii.mytakii@levantem.ai';
   const payload=Buffer.from(JSON.stringify({sub:'render-proof',email,name:'Administrator'})).toString('base64url');
   await context.addCookies([{name:'accessToken',value:`e30.${payload}.render-proof`,domain:'127.0.0.1',path:'/'}]);
   await context.addInitScript((email)=>localStorage.setItem('user',JSON.stringify({id:'render-proof',email,name:'Administrator'})),email);
   const page=await context.newPage();
   await page.clock.install({time:new Date('2026-10-16T14:30:00Z')});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const requests=[];
   let revenueAccessChecks=0;
   await page.route('**/api/revenue-ledger-access',route=>{revenueAccessChecks++;return route.fulfill({json:{hasAccess:scenario!=='locked',passwordConfigured:true}});});
   await page.route('**/v1/**',async route=>{
     const url=new URL(route.request().url());requests.push(url.pathname+url.search);
     if(scenario==='loading') return;
     if(scenario==='partial-error'&&url.pathname.includes('admin-overview/growth')) return route.fulfill({status:503,json:{message:'fixture offline'}});
     let body;
     if(url.pathname.endsWith('/admin-overview/growth')) body=structuredClone(growth);
     else if(url.pathname.endsWith('/admin-overview/marketing')) body=structuredClone(marketing);
     else if(url.pathname.endsWith('/system-monitor/admin/capabilities')) body={canRead:true};
     else if(url.pathname.endsWith('/system-monitor/admin/overview')) {body=structuredClone(monitoring);if(scenario==='monitor-stale')body.workerHeartbeatAt='2026-10-16T13:00:00Z';if(scenario==='monitor-fail')body.checks[0].status='fail';}
     else if(url.pathname.endsWith('/support-chat/admin/tickets')) body={items:[],total:4,page:1,limit:1};
     else if(url.pathname.endsWith('/revenue-ledger/admin/entries')) {const date=url.searchParams.get('dateFrom').slice(0,10);body={items:[],summary:summary(date==='2026-10-10'?2846.2:date==='2026-10-15'?392.49:428.6,date==='2026-10-10')};}
     else if(url.pathname.endsWith('/match-predictions/admin/evaluations')) {const day=url.searchParams.get('dateFrom').slice(0,10);const accuracy=[57.9,68,66,73,70,81,68.4][days.indexOf(day)];body={items:[],summary:{...metric,accuracy,v9:{...metric,accuracy,roiPercent:6.8,byMarket:[],byOdds:[]}}};}
     else if(url.pathname.endsWith('/app-events/admin/analytics')) {body=structuredClone(events);if(url.searchParams.get('from').startsWith('2026-10-15'))body.summary.totalEvents=1753;}
     else if(url.pathname.endsWith('/onboarding-funnel/admin/analytics'))body={summary:{sessionsStarted:190,sessionsCompleted:137,completionRate:137/190,averageSecondsToCompletion:102}};
     else return route.fulfill({status:404,json:{message:'Unexpected proof request'}});
     if(scenario==='empty'){
       if(url.pathname.includes('admin-overview/growth')) {for(const key of ['registrations','subscriptions']){body[key].today=0;body[key].previous=0;body[key].daily.forEach(p=>p.value=0);}}
       if(url.pathname.includes('admin-overview/marketing')) body={campaigns:{sent:0,opened:0,openRate:null},email:{delivered:0,clicked:0,clickRate:null},deliveryFailures:0};
       if(url.pathname.includes('/support-chat/'))body.total=0;
       if(url.pathname.includes('/revenue-ledger/')) { body.summary=summary(0,true); body.summary.totalEntries=0; body.summary.usdRevenue=usd(0); body.summary.dailyUsdRevenue=days.map(date=>point(date,0)); body.summary.storeAdjustedRevenue={...body.summary.storeAdjustedRevenue,missingCurrencies:[]}; body.summary.dailyStoreAdjustedRevenue=days.map(date=>({date,grossAmountUsd:'0',estimatedNetAmountUsd:'0',estimatedStoreCommissionUsd:'0'})); }
       if(url.pathname.includes('/evaluations')){for(const obj of [body.summary,body.summary.v9]){obj.accuracy=null;obj.evaluated=0;obj.pending=0;obj.roiPercent=null;}}
       if(url.pathname.includes('/app-events/')){body.summary.businessActionEvents=0;body.summary.totalEvents=0;body.countsByEvent=[];}
       if(url.pathname.includes('/onboarding-funnel/'))body.summary={sessionsStarted:0,sessionsCompleted:0,completionRate:0,averageSecondsToCompletion:null};
     }
     return route.fulfill({json:body,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'}});
   });
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.goto(`${base}/dashboard`,{waitUntil:'domcontentloaded'});
   await page.getByRole('heading',{name:'Overview',exact:true}).waitFor();
   if(scenario!=='loading')await page.getByRole('button',{name:'Refresh',exact:true}).waitFor({state:'visible'});
   if(scenario!=='loading')await page.waitForFunction(()=>!document.querySelector('button[disabled]'));
   await page.screenshot({path:path.join(out,`desktop-${scenario}.png`),fullPage:true,animations:'disabled'});
   if(scenario==='healthy')fs.writeFileSync(path.join(out,'layout.json'),JSON.stringify(await page.evaluate(()=>Array.from(document.querySelectorAll('main>header,main>section,main>div>section')).map(e=>({name:e.getAttribute('aria-label')||e.tagName,y:e.getBoundingClientRect().y,height:e.getBoundingClientRect().height,children:Array.from(e.children).map(c=>({tag:c.tagName,cls:c.className,h:c.getBoundingClientRect().height,mt:getComputedStyle(c).marginTop,mb:getComputedStyle(c).marginBottom,fs:getComputedStyle(c).fontSize,lh:getComputedStyle(c).lineHeight}))}))),null,2));
   let overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   results.push({scenario,viewport:'1536x1024',overflow,errors:[...errors],requests:requests.length,revenueAccessChecks});
   if(scenario==='healthy'){
     const eventList=page.getByRole('list',{name:'User events by frequency'});
     await eventList.press('End');
     await page.waitForFunction(()=>{const el=document.querySelector('[aria-label="User events by frequency"]');return el.scrollTop+el.clientHeight>=el.scrollHeight-1;});
     const eventScroll=await eventList.evaluate(el=>({scrollTop:el.scrollTop,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight,lastEvent:el.lastElementChild.textContent}));
     if(eventScroll.scrollTop<=0||!eventScroll.lastEvent.endsWith('64'))throw new Error('All user events must remain reachable by keyboard scrolling: '+JSON.stringify(eventScroll));
     await page.screenshot({path:path.join(out,'desktop-events-scrolled.png'),fullPage:true});
     results.push({scenario:'all-user-events',...eventScroll});
     await eventList.press('Home');
     await page.waitForFunction(()=>document.querySelector('[aria-label="User events by frequency"]').scrollTop===0);
     await page.setViewportSize({width:1024,height:900});await page.screenshot({path:path.join(out,'tablet.png'),fullPage:true});results.push({scenario:'tablet',overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
     await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true});
     await page.getByRole('button',{name:'Open navigation'}).click();await page.screenshot({path:path.join(out,'mobile-navigation.png'),fullPage:true});
     await page.getByRole('link',{name:'App Events',exact:true}).click();await page.waitForURL('**/dashboard/app-events-analytics');
     results.push({scenario:'mobile-navigation',url:page.url(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
   }
   if(scenario==='revenue-hidden'){
     if(await page.getByRole('region',{name:'Revenue',exact:true}).count()||revenueAccessChecks||requests.some(url=>url.includes('/revenue-ledger/')))throw new Error('Hidden Revenue must not render or make financial requests');
     for(const [name,viewport] of [['desktop',{width:1536,height:1024}],['tablet',{width:1024,height:900}],['mobile',{width:390,height:844}]]){
       await page.setViewportSize(viewport);
       const layout=await page.evaluate(()=>{const first=document.querySelector('section[aria-label="New registrations"]');const second=document.querySelector('section[aria-label="New paid subscriptions"]');const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,right:r.right};};return {first:rect(first),second:rect(second),row:rect(first.parentElement),childCount:first.parentElement.children.length};});
       if(layout.childCount!==2||Math.abs(layout.first.width-layout.second.width)>1)throw new Error('Hidden Revenue must leave exactly two equal cards');
       if(viewport.width>700&&(Math.abs(layout.first.y-layout.second.y)>1||Math.abs(layout.second.right-layout.row.right)>1))throw new Error('The two cards must fill the top row');
       if(viewport.width<=700&&(Math.abs(layout.first.width-layout.row.width)>1||layout.second.y<=layout.first.y))throw new Error('Mobile cards must stack at full width');
       await page.screenshot({path:path.join(out,`${name}-revenue-hidden.png`),fullPage:true});
       results.push({scenario:`revenue-hidden-${name}`,layout,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
     }
   }
   await context.close();
 }
 fs.writeFileSync(path.join(out,'capture-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));} finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
