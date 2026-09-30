// Synthetic fixture for isolated tests. This is not an API response or live job.
export function syntheticElement(overrides={}) {
  return {
    jobPostingUrl:'https://www.linkedin.com/ad-library/job/detail/123456789',
    isRestricted:false,
    jobDetails:{
      jobTitle:'SYNTHETIC TEST Engineer',jobLocation:'SYNTHETIC TEST Location',
      organizationName:'SYNTHETIC TEST Organization',organizationUrl:'https://www.linkedin.com/company/synthetic-test-organization',payerName:'SYNTHETIC TEST Payer',
      jobListTimeInMilliseconds:Date.parse('2026-09-01T00:00:00Z'),jobClosedTimeInMilliseconds:Date.parse('2026-09-20T00:00:00Z'),
      jobStatistics:{totalImpressions:{start:0,end:1000},impressionsPerCountry:[{country:'urn:li:country:de',impressionPercentage:48},{country:'urn:li:country:us',impressions:11}]},
      jobTargeting:[{facetName:'Location',includedSegments:['SYNTHETIC TEST Region'],excludedSegments:[],isIncluded:true,isExcluded:false}],
      ...(overrides.jobDetails??{})
    },
    ...Object.fromEntries(Object.entries(overrides).filter(([k])=>k!=='jobDetails'))
  };
}
