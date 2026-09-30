import {createHash} from 'node:crypto';
import {validJobUrl} from './input.js';

function text(value){return typeof value==='string'&&value.trim()&&value.length<=10000?value.trim():null;}
function publicCompanyUrl(value){try{const u=new URL(value);if(u.protocol!=='https:'||u.hostname!=='www.linkedin.com'||u.username||u.password||u.port||u.hash||!/^\/company\/[A-Za-z0-9_-]+\/?$/.test(u.pathname)||[...u.searchParams.keys()].some(x=>x!=='trk'))return null;u.search='';return u.href;}catch{return null;}}
function timestamp(value){if(!Number.isSafeInteger(value)||value<=0)return null;try{return new Date(value).toISOString();}catch{return null;}}
function range(value){const raw=value&&typeof value==='object'&&!Array.isArray(value)?{start:value.start??null,end:value.end??null}:null;const valid=raw&&Number.isSafeInteger(raw.start)&&Number.isSafeInteger(raw.end)&&raw.start>=0&&raw.end>=raw.start&&raw.end<=1e12;return {raw,min:valid?raw.start:null,max:valid?raw.end:null,minInclusive:null,maxInclusive:null,estimated:true,parseStatus:valid?'api_estimated_range':raw?'unrecognized':'missing'};}
function country(row){const raw=row&&typeof row==='object'?row:null;const sourceKey=raw?.impressionPercentage!==undefined?'impressionPercentage':raw?.impressions!==undefined?'impressions':null;const value=sourceKey?raw[sourceKey]:null;const valid=typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=100;const urn=typeof raw?.country==='string'&&/^urn:li:country:[a-z]{2}$/i.test(raw.country)?raw.country:null;return {countryUrn:urn,countryCode:urn?urn.split(':').pop().toUpperCase():null,raw:value,sourceKey,value:valid?value:null,max:null,maxInclusive:null,rounded:true,parseStatus:valid&&urn?'source_percentage':'unrecognized'};}
function targeting(value){if(!Array.isArray(value))return [];return value.slice(0,100).map(x=>({facetName:text(x?.facetName),includedSegments:Array.isArray(x?.includedSegments)?x.includedSegments.filter(x=>typeof x==='string').slice(0,100):[],excludedSegments:Array.isArray(x?.excludedSegments)?x.excludedSegments.filter(x=>typeof x==='string').slice(0,100):[],isIncluded:typeof x?.isIncluded==='boolean'?x.isIncluded:null,isExcluded:typeof x?.isExcluded==='boolean'?x.isExcluded:null}));}

export function parseApiElement(element,{observedAt=new Date().toISOString(),includeCountryDistribution=true}={}){
  const row={schemaVersion:'linkedin-paid-job-library/1',status:'diagnostic',usable:false,jobId:null,title:null,jobLocation:null,company:null,companyUrl:null,payer:null,ranFrom:null,ranTo:null,listedAt:null,closedAt:null,sourceOpenEnded:null,sourceUrl:null,observedAt,collectionMethod:'official_linkedin_job_library_api',totalImpressions:range(null),impressionsByCountry:[],targeting:[],restricted:null,diagnostics:[],warnings:[]};
  if(!element||typeof element!=='object'||Array.isArray(element)){row.diagnostics.push('invalid_element');return row;}
  if(!validJobUrl(element.jobPostingUrl)){row.diagnostics.push('invalid_source_job_url');return row;}
  row.sourceUrl=element.jobPostingUrl;row.jobId=new URL(row.sourceUrl).pathname.split('/').pop();
  row.restricted=typeof element.isRestricted==='boolean'?element.isRestricted:null;
  if(row.restricted===true){row.diagnostics.push('restricted_job');return row;}
  const details=element.jobDetails;
  if(!details||typeof details!=='object'||Array.isArray(details)){row.diagnostics.push('missing_job_details');return row;}
  row.title=text(details.jobTitle);row.jobLocation=text(details.jobLocation);row.company=text(details.organizationName);row.payer=text(details.payerName);row.companyUrl=publicCompanyUrl(details.organizationUrl);
  row.listedAt=timestamp(details.jobListTimeInMilliseconds);row.closedAt=timestamp(details.jobClosedTimeInMilliseconds);row.ranFrom=row.listedAt?.slice(0,10)??null;row.ranTo=row.closedAt?.slice(0,10)??null;
  // Missing closure is unknown, not evidence the underlying job is open.
  row.sourceOpenEnded=row.closedAt?false:null;
  if(details.jobClosedTimeInMilliseconds!==undefined&&details.jobClosedTimeInMilliseconds!==null&&details.jobClosedTimeInMilliseconds!==0&&!row.closedAt)row.diagnostics.push('invalid_closed_timestamp');
  if(row.listedAt&&row.closedAt&&row.closedAt<row.listedAt)row.diagnostics.push('reversed_run_window');
  const observed=Date.parse(observedAt);if(!Number.isFinite(observed))row.diagnostics.push('invalid_observed_at');
  if(row.listedAt&&Date.parse(row.listedAt)>observed)row.diagnostics.push('future_listed_timestamp');
  if(row.closedAt&&Date.parse(row.closedAt)>observed)row.diagnostics.push('future_closed_timestamp');
  for(const key of ['title','company','payer','listedAt'])if(!row[key]||/^(?:unknown|n\/a|not available|null|-)$/i.test(row[key]))row.diagnostics.push(`missing_or_unknown_${key}`);
  if(!row.companyUrl)row.warnings.push('company_url_not_observed');
  row.totalImpressions=range(details.jobStatistics?.totalImpressions);
  if(includeCountryDistribution&&Array.isArray(details.jobStatistics?.impressionsPerCountry))row.impressionsByCountry=details.jobStatistics.impressionsPerCountry.slice(0,300).map(country);
  if(row.totalImpressions.parseStatus!=='api_estimated_range')row.warnings.push(`total_impressions_${row.totalImpressions.parseStatus}`);
  if(row.impressionsByCountry.some(x=>x.parseStatus==='unrecognized'))row.warnings.push('unrecognized_country_percentage');
  row.targeting=targeting(details.jobTargeting);
  row.contentHash=createHash('sha256').update(JSON.stringify({title:row.title,company:row.company,payer:row.payer,listedAt:row.listedAt,closedAt:row.closedAt,totalImpressions:row.totalImpressions,impressionsByCountry:row.impressionsByCountry,targeting:row.targeting})).digest('hex');
  if(!row.diagnostics.length){row.usable=true;row.status='usable_metadata';}
  return row;
}

export function apiCsv(records){const columns=['jobId','title','jobLocation','company','payer','listedAt','closedAt','totalImpressionsMin','totalImpressionsMax','sourceUrl','observedAt'];const safe=v=>{let s=String(v??'');if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};return [columns.join(','),...records.map(r=>columns.map(k=>safe(k==='totalImpressionsMin'?r.totalImpressions.min:k==='totalImpressionsMax'?r.totalImpressions.max:r[k])).join(','))].join('\r\n')+'\r\n';}
