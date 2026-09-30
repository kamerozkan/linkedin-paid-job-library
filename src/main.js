import {Actor,log} from 'apify';
import {normalizeApiInput} from './input.js';
import {createApiProvider} from './api.js';
import {runCandidate} from './runner.js';
import {failureSummary} from './artifacts.js';

await Actor.init();
let failed=false;
let result=null;
try{
  const {input,token}=normalizeApiInput((await Actor.getInput())??{},process.env);
  const provider=createApiProvider({token});
  result=await runCandidate({input,provider,emit:row=>Actor.pushData(row)});
  await Actor.setValue('OUTPUT',result.output);
  await Actor.setValue('report.csv',result.csv,{contentType:'text/csv; charset=utf-8'});
  await Actor.setStatusMessage(`${result.output.status}: ${result.records.length} usable results, 0 result charges. R&D candidate.`);
  log.info('Candidate run completed',{status:result.output.status,usableResultCount:result.records.length,diagnosticCount:result.output.diagnosticCount,chargedCount:0,commercialReady:false});
  failed=['FAILED_SOURCE','FAILED_QUALITY_GATE','BLOCKED'].includes(result.output.status);
}catch(error){
  failed=true;
  const invalid=error.message?.startsWith('INVALID_INPUT:');
  const fallback=failureSummary(result,error);
  try{await Actor.setValue('OUTPUT',fallback);}catch{log.error('Could not save final OUTPUT status.',{knownDeliveredRows:fallback.usableResultCount,chargedCount:0});}
  log.error(invalid?error.message:'Candidate failed; inspect OUTPUT for its status.',{knownDeliveredRows:result?.records.length??0});
}
if(failed)await Actor.fail('R&D candidate did not produce a healthy source result. See OUTPUT.');
await Actor.exit();
