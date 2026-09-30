# Synthetic examples

Every data record here is fictional contract data. `exampleIsLiveData: false` and `synthetic_fixture` identify that boundary. These files are not LinkedIn observations, Actor results, customer records or paid events. Do not request the placeholder source URLs as real jobs.

`input.json` demonstrates a bounded query without credentials. The keyword is a query shape, not evidence of any matching jobs. Dates are explicit and the end is exclusive. Runtime use remains blocked until approved access and permitted use are verified.

`synthetic-api-response.json` is a small API-shaped fixture. It uses invented companies, payers and identifiers; its third-party source hostname demonstrates the URL shape only. It includes both documented country field aliases and a missing closure timestamp to test preservation of uncertainty.

`synthetic-metadata.csv` is a compact illustration of those fictional fields, not a runtime CSV export. Blank closure means unknown. Its range endpoint inclusivity is unknown. JSON keeps raw fixture values, and production CSV safety must be checked against formula-like text in offline tests.

`synthetic-normalized-records.json` was produced by the candidate parser offline at a fixed fictional observation time. Its wrapper labels the records as non-live. `synthetic-runtime-export.csv` was produced by the same candidate CSV formatter from those fictional records; all titles carry `[SYNTHETIC]`. Neither file came from an Actor run or source request.

There is no public live-output example in this package. Actual manual captures remain private and are not an automatic source or commercial-permission proof.
