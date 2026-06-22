// Copyright 2025 Ellucian Company L.P. and its affiliates.
//
// Offline mock data layer. Enabled when USE_MOCK_DATA=true (see .env). Lets the
// card run with `npm start` without any Ethos / Data Connect backend, so the UI
// can be built and demoed locally. None of this code path touches the network.

import log from 'loglevel';
const logger = log.getLogger('default');

// Whether the mock layer is active. dotenv-webpack inlines process.env at build.
export const USE_MOCK = process.env.USE_MOCK_DATA === 'true';

// In-memory "Banner" state for the session. Seed values are configurable via .env
// so you can demo each card state without editing code:
//   MOCK_ELIGIBLE=false        -> student is not awarded a Texas grant (card hides)
//   MOCK_CURRENT_ANSWER=yes|no -> start with a previously recorded response
const seedEligible = process.env.MOCK_ELIGIBLE !== 'false';
const seedAnswerRaw = (process.env.MOCK_CURRENT_ANSWER || '').toLowerCase();
const seedAnswer = seedAnswerRaw === 'yes' ? true : seedAnswerRaw === 'no' ? false : null;

const store = {
    eligible: seedEligible,
    bannerId: 'MOCK00001',
    aidYear: process.env.MOCK_AID_YEAR || '2526',
    currentAnswer: seedAnswer,
    statDate: seedAnswer === null ? null : new Date().toISOString().slice(0, 10)
};

// Mirrors the shape returned by the GET pipeline's "Compose result" transform.
export function getMockAttestation() {
    return {
        eligible: store.eligible,
        bannerId: store.bannerId,
        aidYear: store.aidYear,
        currentAnswer: store.currentAnswer,
        currentStatus: store.currentAnswer === null ? null : (store.currentAnswer ? 'Y' : 'N'),
        statDate: store.statDate
    };
}

// Mirrors recordAttestation(): persists the answer to the in-memory store.
export async function recordMockAttestation({ answer }) {
    // simulate a little latency so the busy spinner is visible locally
    await new Promise(resolve => setTimeout(resolve, 400));
    store.currentAnswer = answer === true;
    store.statDate = new Date().toISOString().slice(0, 10);
    logger.debug('mock attestation recorded:', { answer: store.currentAnswer, statDate: store.statDate });
    return { status: 'success', data: getMockAttestation() };
}
