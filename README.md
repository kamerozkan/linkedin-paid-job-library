# LinkedIn Job Library Scraper: Payers & EU Impressions

<img src="https://raw.githubusercontent.com/kamerozkan/linkedin-paid-job-library/main/assets/logo.png" alt="Independent Job Library product icon" width="112" height="112">

**Research and development candidate. Status: `SOURCE_AND_COMMERCIAL_PERMISSION_GATED`, 1 October 2026.** No approved API access, separate commercial permission or successful cloud collection has been verified for this project. Billing is disabled. This repository is not a ready paid data feed.

The candidate implements a bounded client for LinkedIn's official Job Library API. Its intended output is paid-job archive metadata: job identity, company, payer, reported dates, estimated impression ranges and country breakdowns where supplied. The Job Library archive at `/ad-library/job` is distinct from general Ad Library creative searches and ordinary LinkedIn job search.

## Access and permission come first

The official API requires an approved LinkedIn Ad Library product and a member token from the supported three-legged OAuth flow. A normal LinkedIn account, a publicly visible source page or a valid token for another LinkedIn product does not establish this access. [Job Library API documentation](https://www.linkedin.com/ad-library/api/jobs)

API approval alone also does not establish permission to sell this service or redistribute raw data. LinkedIn's Research API terms restrict standalone tools and raw data distribution in section 1.4, commercial uses and tool-based work products in section 3.1, and distinguish Developer Site access approval from required written permission in section 7.5. Commercial publication remains blocked until the relevant written permission and scope are verified. [LinkedIn Research API Program Terms](https://www.linkedin.com/legal/l/research-api-terms)

Normal HTTP and clean public-browser preflights returned HTTP 403. A separate plain-Chromium test in the actual Apify cloud also returned HTTP 403 from Cloudflare and found zero Job Library detail links. No successful live rows have been verified. There is no browser bypass provider in this candidate. The 30 passing tests use local synthetic fixtures and do not establish source access. See [verification status](evidence/verification.json).

## Candidate interface

The candidate accepts `sourceMode: "officialApi"` and at least one of `keyword`, `organization` or `payerName`. Optional `countries` uses uppercase two-letter codes. Paired `dateFrom` and `dateTo` use `YYYY-MM-DD`; the start is inclusive and the end is exclusive. `maxJobs` defaults to 24 with a maximum of 100; `maxPages` defaults to 1 with a maximum of 5. Country breakdowns are included by default.

A safe input shape without credentials is available at [examples/input.json](examples/input.json). Its dates are explicit because the API's documented default covers a narrow recent window. Keywords use the source's term matching; they are not a promise of a broad semantic search. Direct job URL input and comparison-state monitoring are not supported by this API candidate.

An approved token would be supplied through the secret `linkedinAccessToken` input or `LINKEDIN_ACCESS_TOKEN` environment variable. Never commit a token or put it in a URL. Do not start a source request until project access and permitted use are established.

The [input schema proposal](schemas/input.schema.json) describes the candidate interface. Runtime validation also checks real calendar dates, paired dates and start-before-end ordering.

## Output contract

The [output schema proposal](schemas/output.schema.json) covers normalized candidate records. It is a contract proposal, not live output evidence.

| Fields | Meaning |
| --- | --- |
| `jobId`, `sourceUrl` | Source archive identity and detail page. |
| `title`, `jobLocation`, `company`, `companyUrl`, `payer` | Source-reported job, company and payer metadata. |
| `listedAt`, `closedAt`, `ranFrom`, `ranTo` | Source timestamps and derived dates. Missing closure remains unknown. |
| `sourceOpenEnded` | Unknown when closure is missing; false when a closing timestamp is known. It does not establish current availability. |
| `totalImpressions` | Estimated API range with original bounds and unknown endpoint inclusivity. |
| `impressionsByCountry` | Country identifier, raw source number and source field name. |
| `targeting` | Source targeting fields, preserved without inventing missing values. |
| `observedAt`, `collectionMethod`, `contentHash`, `warnings` | Collection provenance, comparison digest and record limitations. |

Impression estimates are not advertising spend, budget, conversions or unique audience size. LinkedIn explains that country percentages are rounded; a displayed `<1%` is a bound rather than zero. [Targeting and impressions help](https://www.linkedin.com/help/linkedin/answer/a7454261)

The API's documented country percentage field names differ between its table and example. The candidate preserves which field was present. Its estimated range does not inherit the inclusivity rules of a browser label such as `<1k`.

## Inspect each batch

Usable records belong in the default dataset. Source and parsing diagnostics belong in the key-value store `OUTPUT`, together with the status and counts. The planned CSV artifact is `report.csv`. A platform-successful run is not sufficient: inspect useful rows, access status and the summary together.

Page and result caps can truncate a scan. No complete-archive claim is made, and absence from a batch is not evidence that a job closed. Pagination completeness has not been validated against an approved live response. Billing remains disabled with `chargedCount: 0`; no price is configured or promised by these examples.

## Examples and tests

All public data examples are **synthetic contract fixtures**, marked `exampleIsLiveData: false`. They are not source captures, Actor results, customers or billable events. The source-shaped URLs inside a fixture are placeholders and must not be requested as real records. Actual manual metadata captures remain outside the public package.

- [Input shape](examples/input.json)
- [Synthetic API response](examples/synthetic-api-response.json)
- [Synthetic normalized output](examples/synthetic-normalized-records.json)
- [Example interpretation and CSV](examples/README.md)
- [Research workflows and limits](USE_CASES.md)
- [Data notice](DATA_NOTICE.md)

The candidate source suite passed 30 offline tests for query construction, parsing, diagnostics, deduplication and safe export. Three public synthetic fixture elements also parsed into usable records with no diagnostics. They cannot verify account entitlement, live pagination, automatic source reliability or commercial permission. A successful approved-access cloud batch and a permission review are both required before reconsidering a paid launch.

## Scheduling and support

No schedule is activated by this repository. If the access and permission gates are later satisfied, begin with one small bounded query and inspect its output before saving or scheduling an Apify Task. Repeated snapshots would still describe observed records rather than job closures or full market coverage.

Report a candidate code issue in the [GitHub issue tracker](https://github.com/kamerozkan/linkedin-paid-job-library/issues). Include the test or run ID, warning and a short expected-versus-observed description. Keep tokens, private source data and account information out of issues.

This independent project is not affiliated with or endorsed by LinkedIn. Its illustration is an original product icon, not LinkedIn branding.

## Run the offline contract tests

```sh
npm ci
npm test
```

The Docker build uses Node 22 and runs these tests. Running the Actor without an approved token returns an explicit source failure with zero result charges. This does not demonstrate successful live collection.

## Dated private deployment check

The Actor remains private (`isPublic: false`), and its `latest` tag remains on build `0.1.1` (`I0cAgJx3cCQIVwpwJ`). Owner run `qP6uYcOKpLn7iV6qI` intentionally supplied no LinkedIn token: platform `FAILED`, `OUTPUT.status=FAILED_SOURCE`, reason `API_ACCESS_TOKEN_REQUIRED`, zero source requests, zero dataset rows and zero result charges. This verifies the missing-access failure path only.

The isolated `source-preflight` tag used browser-test build `0.2.1` (`Maf1NdsYPGYpN4i5W`). Run `D51Qkfx1WFvfvw6Ig` made one plain-Chromium navigation in the actual Apify cloud to the `software engineer` search for Germany. It finished `FAILED` at `2026-09-30T23:19:19.234Z`: HTTP 403, a Cloudflare block page and zero detail links. No login, proxy, stealth, custom headers or challenge solving was used. This was a failed source-access test, not a successful API collection or a promotion of build `0.2.1` to `latest`. Its measured run and build usage costs are recorded separately in [verification evidence](evidence/verification.json).

No successful live rows have been verified. Commercial permission and live API collection remain unverified. The [GitHub checks](https://github.com/kamerozkan/linkedin-paid-job-library/actions/runs/36789362955) and the 30 local tests passed using offline synthetic fixtures only.
