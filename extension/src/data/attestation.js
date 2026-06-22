// Copyright 2025 Ellucian Company L.P. and its affiliates.

import log from 'loglevel';
const logger = log.getLogger('default');

/**
 * Records the student's Texas Grant attestation response.
 *
 * The Data Connect POST pipeline maps the boolean `answer` to the configured
 * RRRAREQ trstCode (trstCodeYes / trstCodeNo), stamps RRRAREQ_STAT_DATE with
 * today's date, keys the row with the student's Banner ID + aid year, and writes
 * it through the Banner `applicant_requirements` Business API (RRAAREQ).
 *
 * @param {Function} authenticatedEthosFetch - SDK fetch bound to the user token
 * @param {string} cardId - current card id (binds server configuration)
 * @param {string} cardPrefix - current card prefix (binds server configuration)
 * @param {boolean} answer - true = student attests YES, false = NO
 */
export async function recordAttestation({ authenticatedEthosFetch, cardId, cardPrefix, answer }) {
    const resource = process.env.PIPELINE_POST_TEXAS_GRANT_ATTESTATION;
    try {
        const start = new Date();

        const urlSearchParameters = new URLSearchParams({
            cardId,
            cardPrefix
        }).toString();

        const resourcePath = `${resource}?${urlSearchParameters}`;

        const response = await authenticatedEthosFetch(resourcePath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({ answer })
        });

        const end = new Date();
        logger.debug(`post ${resource} time: ${end.getTime() - start.getTime()}`);

        let result;
        if (response) {
            switch (response.status) {
                case 200:
                    try {
                        const data = await response.json();

                        result = {
                            data,
                            status: 'success'
                        };
                    } catch (error) {
                        result = {
                            error: {
                                message: 'unable to parse response',
                                statusCode: 500
                            }
                        };
                    }
                    break;
                default:
                    result = {
                        error: {
                            message: 'server error',
                            statusCode: response.status
                        }
                    };
            }
        }

        return result;
    } catch (error) {
        logger.error('unable to record attestation: ', error);
        throw error;
    }
}
