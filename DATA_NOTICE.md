# Data notice

**Current status: `SOURCE_AND_COMMERCIAL_PERMISSION_GATED`.** This is a research and development candidate, not a verified automatic or commercially permitted feed. The official API implementation has not produced a verified cloud batch with approved access. Billing is disabled.

## Source and permitted use

The proposed source is LinkedIn's official Job Library API. Approved API access, the approved project's scope and any required separate written permission must be verified before use or commercial distribution. Supplying a customer token is not a substitute for that permission. Read the [Research API Program Terms](https://www.linkedin.com/legal/l/research-api-terms) and the [API documentation](https://www.linkedin.com/ad-library/api/jobs).

## Public sample boundary

Public JSON and CSV files contain synthetic contract fixtures only. They are explicitly labeled `exampleIsLiveData: false` or `synthetic_fixture`. No full job descriptions, real captured job records, applicant records, person-level profiles, access tokens, cookies or private capture bodies are included.

Three dated manual browser observations were used privately to examine visible field meanings. They demonstrate neither API entitlement nor an automatic collection path. Normal HTTP and clean browser preflights were blocked. [Verification status](evidence/verification.json) records these boundaries without publishing captured source data.

## Interpretation

The candidate preserves source-reported identity and payer strings rather than resolving legal entities. Reported timestamps do not prove current job availability. Estimated ranges remain ranges, missing values remain unknown, and raw country fields retain their source key. No record estimates advertising spend, salary, budget, conversions, hiring intent or unique people.

LinkedIn describes a paid-job archive with source-specific retention and restriction rules. EU transparency fields can contain estimated impressions and rounded country percentages. These source properties do not establish the completeness of a bounded API response. See [Job Library help](https://www.linkedin.com/help/linkedin/answer/a7451373) and [targeting and impressions help](https://www.linkedin.com/help/linkedin/answer/a7454261).

## Coverage and exports

Access failures and source errors are diagnostics, not proof of an empty result. Page caps, result caps or unverified pagination mean coverage is incomplete or unknown. The candidate does not infer closure or disappearance and does not maintain a production comparison baseline.

JSON preserves raw values. Spreadsheet CSV text cells that could be interpreted as formulas are escaped; this formatting protection does not change the JSON value. A content digest can support a future same-record comparison, but is not evidence that a record is current or complete.

This project is independent and does not claim LinkedIn affiliation or endorsement.
