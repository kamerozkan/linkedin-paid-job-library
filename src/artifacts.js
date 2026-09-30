export function failureSummary(result,error){
  const invalid=error.message?.startsWith('INVALID_INPUT:');
  const prior=result?.output;
  const diagnostic={code:invalid?'INVALID_INPUT':prior?'OUTPUT_ARTIFACT_FAILED':'INTERNAL_ERROR',message:invalid?error.message:prior?'A final run artifact could not be saved. Previously delivered dataset rows remain counted.':'The candidate failed before source output could be confirmed.'};
  const diagnostics=[...(prior?.diagnostics??[]),diagnostic];
  return {...(prior??{}),schemaVersion:'linkedin-paid-job-library-run/1',status:invalid?'INVALID_INPUT':result?.records.length?'PARTIAL':'FAILED_INTERNAL',commercialReady:false,releaseGate:'SOURCE_AND_COMMERCIAL_PERMISSION_GATED',sourceCoverageComplete:false,usableResultCount:result?.records.length??0,diagnosticCount:diagnostics.length,diagnostics,billing:{enabled:false,eventName:null,chargedCount:0,reason:'R&D candidate. Commercial API permission and healthy source execution are not verified.'}};
}
