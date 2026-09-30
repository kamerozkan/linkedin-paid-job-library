export function validJobUrl(value) {
  if (typeof value !== 'string' || /[\u0000-\u0020\\]/.test(value)) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && u.hostname === 'www.linkedin.com' && !u.port && !u.username && !u.password && !u.search && !u.hash && /^\/ad-library\/job\/detail\/\d+$/.test(u.pathname);
  } catch { return false; }
}

function date(value, field) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value) throw new Error(`INVALID_INPUT: ${field} must be YYYY-MM-DD`);
  return value;
}

function integer(value, defaultValue, max, field) {
  if (value === undefined) return defaultValue;
  if (!Number.isInteger(value) || value < 1 || value > max) throw new Error(`INVALID_INPUT: ${field} must be 1-${max}`);
  return value;
}

function optionalText(value, field) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.length > 200 || /[\u0000-\u001f\u007f]/.test(value) || !value.trim()) throw new Error(`INVALID_INPUT: ${field} must contain 1-200 plain-text characters`);
  return value.trim();
}

export function normalizeApiInput(raw, env={}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('INVALID_INPUT: expected object');
  if (raw.sourceMode && raw.sourceMode !== 'officialApi') throw new Error('INVALID_INPUT: sourceMode must be officialApi');
  const input={sourceMode:'officialApi',keyword:optionalText(raw.keyword,'keyword'),organization:optionalText(raw.organization,'organization'),payerName:optionalText(raw.payerName,'payerName'),countries:[],dateFrom:date(raw.dateFrom,'dateFrom'),dateTo:date(raw.dateTo,'dateTo'),maxJobs:integer(raw.maxJobs,24,100,'maxJobs'),maxPages:integer(raw.maxPages,1,5,'maxPages'),includeCountryDistribution:raw.includeCountryDistribution??true};
  if(raw.jobUrls?.length)throw new Error('INVALID_INPUT: official API mode supports search criteria; jobUrls are not supported');
  if(!input.keyword&&!input.organization&&!input.payerName)throw new Error('INVALID_INPUT: provide keyword, organization or payerName');
  if(raw.countries!==undefined){if(!Array.isArray(raw.countries)||raw.countries.length>10||raw.countries.some(x=>typeof x!=='string'||!/^[A-Z]{2}$/.test(x)))throw new Error('INVALID_INPUT: countries must be up to 10 uppercase country codes');input.countries=[...new Set(raw.countries)];}
  if(Boolean(input.dateFrom)!==Boolean(input.dateTo))throw new Error('INVALID_INPUT: dateFrom and dateTo must be supplied together');
  if(input.dateFrom&&input.dateFrom>=input.dateTo)throw new Error('INVALID_INPUT: dateTo must be after dateFrom because the API end is exclusive');
  if(typeof input.includeCountryDistribution!=='boolean')throw new Error('INVALID_INPUT: includeCountryDistribution must be boolean');
  if(raw.monitorKey)throw new Error('INVALID_INPUT: monitoring state is unavailable until API pagination completeness has been validated');
  const token=raw.linkedinAccessToken??env.LINKEDIN_ACCESS_TOKEN;
  if(token!==undefined&&(typeof token!=='string'||token.length<10||token.length>8192||/[\u0000-\u0020\u007f]/.test(token)))throw new Error('INVALID_INPUT: linkedinAccessToken must be an unmodified access token');
  // Secrets are deliberately outside the persisted/loggable search input.
  return {input,token:token??null};
}
