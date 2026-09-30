export class SourceError extends Error {
  constructor(code,message,status=null){super(message);this.code=code;this.httpStatus=status;}
}
function restDate(value){const [year,month,day]=value.split('-').map(Number);return `(day:${day},month:${month},year:${year})`;}
async function boundedResponseText(response,maxBytes=10_000_000){
  if(response.body&&typeof response.body.getReader==='function'){
    const reader=response.body.getReader(),chunks=[];let total=0;
    try{while(true){const {value,done}=await reader.read();if(done)break;total+=value.byteLength;if(total>maxBytes){await reader.cancel();throw new SourceError('API_RESPONSE_TOO_LARGE','The source response exceeded the 10 MB response limit.');}chunks.push(Buffer.from(value));}}
    finally{reader.releaseLock();}
    return Buffer.concat(chunks,total).toString('utf8');
  }
  const raw=await response.text();
  if(Buffer.byteLength(raw)>maxBytes)throw new SourceError('API_RESPONSE_TOO_LARGE','The source response exceeded the 10 MB response limit.');
  return raw;
}
export function apiUrl(input,{start=0,count=24}={}){
  if(!Number.isInteger(start)||start<0||!Number.isInteger(count)||count<1||count>24)throw new Error('invalid pagination');
  const url=new URL('https://api.linkedin.com/rest/jobLibrary');
  url.searchParams.set('q','criteria');
  if(input.keyword)url.searchParams.set('keyword',input.keyword);
  if(input.organization)url.searchParams.set('organization',input.organization);
  if(input.payerName)url.searchParams.set('payerName',input.payerName);
  if(input.countries.length)url.searchParams.set('countries',`(value:List(${input.countries.map(x=>`urn:li:country:${x.toLowerCase()}`).join(',')}))`);
  if(input.dateFrom)url.searchParams.set('dateRange',`(start:${restDate(input.dateFrom)},end:${restDate(input.dateTo)})`);
  url.searchParams.set('start',String(start));url.searchParams.set('count',String(count));
  url.searchParams.set('sortBy','(order:DESCENDING,field:LISTED_TIME)');
  return url.href;
}
export function createApiProvider({token,fetchImpl=fetch,apiVersion='202607',requestTimeoutMs=30000}={}){
  return {
    async page(input,{start,count}){
      if(!token)throw new SourceError('API_ACCESS_TOKEN_REQUIRED','An approved LinkedIn Job Library API access token is required. No source request or result charge was made.');
      let response;
      try{response=await fetchImpl(apiUrl(input,{start,count}),{method:'GET',headers:{Authorization:`Bearer ${token}`,'X-RestLi-Protocol-Version':'2.0.0','Linkedin-Version':apiVersion,Accept:'application/json'},redirect:'error',signal:AbortSignal.timeout(requestTimeoutMs)});}catch{throw new SourceError('API_NETWORK_ERROR','The approved LinkedIn API request did not complete. No challenge bypass or automatic retry was attempted.');}
      if(!response.ok){const code={400:'API_INVALID_CRITERIA',401:'API_TOKEN_INVALID',403:'API_ACCESS_DENIED',429:'API_RATE_LIMITED'}[response.status]??'API_SOURCE_ERROR';throw new SourceError(code,`LinkedIn Job Library API returned HTTP ${response.status}. No result from this response was charged.`,response.status);}
      const declared=Number(response.headers?.get('content-length'));
      if(declared>10_000_000)throw new SourceError('API_RESPONSE_TOO_LARGE','The source response exceeded the 10 MB response limit.');
      let payload;
      try{payload=JSON.parse(await boundedResponseText(response));}catch(e){if(e instanceof SourceError)throw e;throw new SourceError('API_INVALID_RESPONSE','LinkedIn returned an unreadable API response.');}
      if(!payload||!Array.isArray(payload.elements)||payload.elements.length>count)throw new SourceError('API_INVALID_RESPONSE','LinkedIn returned an unexpected element structure.');
      if(payload.paging!==undefined&&(!payload.paging||typeof payload.paging!=='object'||(payload.paging.start!==undefined&&(!Number.isInteger(payload.paging.start)||payload.paging.start!==start))||(payload.paging.total!==undefined&&(!Number.isInteger(payload.paging.total)||payload.paging.total<0))))throw new SourceError('API_INVALID_RESPONSE','LinkedIn returned an unexpected pagination structure.');
      return payload;
    }
  };
}
