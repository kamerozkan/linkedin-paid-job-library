import {parseApiElement,apiCsv} from './api-parser.js';

export async function runCandidate({input,provider,emit=async()=>{},observedAt=()=>new Date().toISOString()}){
  const records=[],diagnostics=[],seen=new Set(),pages=[];
  let start=0,error=null,sourceReturnedShortPage=false,deliveryError=false;
  for(let pageIndex=0;pageIndex<input.maxPages&&records.length<input.maxJobs;pageIndex++){
    const count=Math.min(24,input.maxJobs-records.length);
    let page;
    try{page=await provider.page(input,{start,count});}catch(e){error={code:e.code??'API_SOURCE_ERROR',httpStatus:e.httpStatus??null,message:typeof e.code==='string'?e.message:'The source request failed.'};diagnostics.push(error);break;}
    const at=observedAt();
    pages.push({start,requestedCount:count,returnedCount:page.elements.length,observedAt:at,total:page.paging?.total??null});
    for(const element of page.elements){
      const row=parseApiElement(element,{observedAt:at,includeCountryDistribution:input.includeCountryDistribution});
      if(!row.usable){diagnostics.push({jobId:row.jobId,code:row.diagnostics[0],details:row.diagnostics});continue;}
      if(seen.has(row.jobId)){diagnostics.push({jobId:row.jobId,code:'duplicate_job_suppressed'});continue;}
      seen.add(row.jobId);
      try{await emit(row);}catch{deliveryError=true;error={code:'OUTPUT_DELIVERY_FAILED',message:'A validated result could not be written to the dataset.'};diagnostics.push(error);break;}
      records.push(row);
      if(records.length>=input.maxJobs)break;
    }
    if(deliveryError)break;
    start+=page.elements.length;
    if(page.elements.length<count){sourceReturnedShortPage=true;break;}
    if(!page.elements.length)break;
  }
  const status=error?(records.length?'PARTIAL':error.code==='API_ACCESS_DENIED'?'BLOCKED':'FAILED_SOURCE'):records.length?(diagnostics.some(d=>d.code!=='duplicate_job_suppressed')?'PARTIAL':'SUCCEEDED'):diagnostics.length?'FAILED_QUALITY_GATE':'EMPTY';
  const output={schemaVersion:'linkedin-paid-job-library-run/1',status,commercialReady:false,releaseGate:'SOURCE_AND_COMMERCIAL_PERMISSION_GATED',sourceProvider:'official_linkedin_job_library_api',sourceCoverageComplete:false,requestedPageOperationsComplete:!error,sourceReturnedShortPage,sourcePaginationContractLiveValidated:false,maxJobs:input.maxJobs,maxPages:input.maxPages,pages,usableResultCount:records.length,diagnosticCount:diagnostics.length,diagnostics,monitorStateUpdated:false,billing:{enabled:false,eventName:null,chargedCount:0,reason:'R&D candidate. Commercial API permission and healthy source execution are not verified.'},limitations:['Official source access requires an approved member token. Access does not establish commercial reuse permission.','The Job Library is a paid-job archive. Listed or missing-closure metadata does not establish an active job.','Impressions are estimated ranges; source bound inclusion is unspecified. Country percentages remain source estimates.','The displayed official API example does not establish an exhaustive pagination contract. No full-archive or disappearance/closure claim is made.','No start, source error, restricted job, diagnostic or result is charged by this candidate.']};
  return {output,records,csv:apiCsv(records)};
}
