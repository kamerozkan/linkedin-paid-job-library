# Ordinary cloud browser access preflight

This is the exact diagnostic source used for the separate Apify `source-preflight` build 0.2.1. It is not the default Actor runtime and does not collect job records or charge customers.

One fresh, ordinary Chromium context visited the public job search page in Apify cloud. It used no login, proxy, stealth setting, custom request headers or challenge solver. The container uses the standard `--no-sandbox` flag needed by the image. The diagnostic stops after a failed or blocked navigation.

Observed result on 2026-09-30 at 23:19 UTC: HTTP 403, a Cloudflare block page, zero canonical job detail links. Run `D51Qkfx1WFvfvw6Ig` failed; full collection and commercial readiness remain false. The default `latest` tag stayed on candidate build 0.1.1.

These files are retained to reproduce the method and audit the observation. They are not a recommendation to retry a blocked source or a production collection provider. They do not establish that the public source is commercially usable.
