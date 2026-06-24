# Texas Grant Attestation - Data Connect Serverless APIs

This card uses two Data Connect serverless API pipelines:

| File | Method | Purpose |
| --- | --- | --- |
| `ethos-example-get-texas-grant-attestation.json` | GET | Resolve the student's Banner ID, check Texas-grant eligibility via `award-maintenance` (RPRAWRD), and read any existing attestation row from `applicant-requirements` (RRAAREQ). Returns `{ eligible, currentAnswer, statDate, ... }`. |
| `ethos-example-post-texas-grant-attestation.json` | POST | Re-validate eligibility, map the boolean answer to the configured RRRAREQ status code, and write the row through the `applicant-requirements` Business API (RRAAREQ). |

## Banner mapping

The attestation is modeled as a Banner Financial Aid **tracking requirement** on RRAAREQ
(table `RRRAREQ`), written through the `applicant_requirements` Banner Business API:

| Concept | RRRAREQ column | Pipeline field |
| --- | --- | --- |
| Banner ID | `RRRAREQ_KEYBLCK_PIDM` (via `keyblckId`) | `keyblckId` |
| Aid year | `RRRAREQ_KEYBLCK_AIDY_CODE` | `keyblckAidyCode` |
| Requirement (the attestation) | `RRRAREQ_TREQ_CODE` | `treqCode` |
| Status (the answer) | `RRRAREQ_TRST_CODE` | `trstCode` |
| Status date | `RRRAREQ_STAT_DATE` | `statDate` |

Eligibility ("awarded a Texas grant") is checked against the `award-maintenance`
Business API (table `RPRAWRD`) by matching `fundCode` to the configured Texas grant
fund code(s) for the given aid year.

## Pipeline parameters

Both pipelines take these parameters. In Experience they are bound to the card's
**server configuration** values (Step 2 - Configuration), so nothing is hardcoded:

| Parameter | Example | Notes |
| --- | --- | --- |
| `ethosApiKey` | *(secret)* | Ethos Integration application API key. |
| `aidYear` | `2526` | RRRAREQ / RPRAWRD `keyblckAidyCode`. |
| `texasGrantFundCodes` | `TXEG,TPEG` | Comma-separated fund codes that count as a Texas grant. |
| `attestationTreqCode` | *(your code)* | Tracking requirement code for the felony/controlled-substance attestation. |
| `trstCodeYes` | *(your code)* | Status code recorded when the student attests YES. |
| `trstCodeNo` | *(your code)* | Status code recorded when the student attests NO. |
| `testPersonId` | *(blank)* | Only used for preview/testing; the user token supplies the real person. |

> **Confirm in your tenant before publishing:** the Business API resource names
> (`award-maintenance`, `applicant-requirements`) and `acceptVersions` / `contentVersion`
> values used here (`1.0.0`) must match how those Banner Business APIs are published as
> Ethos resources in your environment. Adjust the `resource` and version strings in the
> JSON if they differ. You must also define the `attestationTreqCode`, `trstCodeYes`, and
> `trstCodeNo` values on RTVTREQ / RTVTRST in Banner Financial Aid.

## Create the pipelines

For each JSON file:

1. Log in to Experience in a tenant with Data Connect - Integration Designer enabled.
2. Create a package, e.g. `<prefix>-experience-ethos-examples`.
3. Create a pipeline (**+PIPELINE**), type **API**.
4. Name it, e.g. `<prefix>-ethos-example-get-texas-grant-attestation`.
5. Pick the HTTP method indicated by the file (GET or POST).
6. Authentication Type - **User Token**. Click **SAVE**.
7. From the method dropdown at the top, pick **Import Pipeline** and import the JSON file.
8. **SAVE**, then **PUBLISH**.

## Permissions

Grant the **Execute** permission on both APIs to a role that contains your students
(Experience Setup → PERMISSIONS → DATA CONNECT → APIs → your package).
