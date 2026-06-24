# Ethos Guide

This card uses Ethos Integration (through Data Connect) to read and write Banner
Financial Aid data. It uses the following resources:

## Banner resources

1. EEDM `persons` v12 - to resolve the signed-in user to a Banner ID.
   [persons](https://resources.elluciancloud.com/bundle/ethos_integration_resources/page/persons.html)
1. Banner Business API `award-maintenance` (RPRAWRD) - to determine whether the student
   has been awarded a Texas grant for the aid year.
1. Banner Business API `applicant-requirements` (RRAAREQ / RRRAREQ) - to read and record
   the felony / controlled-substance attestation as a financial-aid tracking requirement.

## Ethos Integration setup

This card needs an Ethos Integration Application API Key to make calls to Ethos. You can
reuse the Integration Application used by Experience or create a dedicated one, following
[Create an application in Ethos Integration for Ellucian Experience](https://resources.elluciancloud.com/bundle/ellucian_experience_acn_configure/page/t_create_app_ethos_experience.html).

Ensure the resources above are available on the underlying Banner APIs with the
credentials used, and that the Banner Business APIs `award-maintenance` and
`applicant-requirements` are published and reachable through Ethos.

## Banner Financial Aid configuration

Before students use the card, a financial-aid administrator must:

1. Define the attestation **tracking requirement** code on RTVTREQ (used as `attestationTreqCode`).
1. Define the **status** codes on RTVTRST for the YES and NO answers (used as `trstCodeYes` / `trstCodeNo`).
1. Confirm the **fund code(s)** that represent a Texas grant on RFRBASE (used as `texasGrantFundCodes`).
1. Confirm the current **aid year** code (used as `aidYear`).
