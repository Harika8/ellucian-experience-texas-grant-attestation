module.exports = {
    name: 'texas-grant-attestation',
    publisher: process.env.PUBLISHER,
    cards: [{
        type: 'TexasGrantAttestationCard',
        source: './src/cards/TexasGrantAttestation.jsx',
        title: 'Texas Grant Attestation',
        displayCardType: 'Texas Grant Attestation',
        description: 'Felony / controlled-substance attestation for students awarded a Texas grant. Records the response to Banner RRAAREQ.',
        configuration: {
            // These server configuration values are bound to the matching Data Connect
            // pipeline parameters in Experience Setup (Step 2 - Configuration). Keeping
            // the Banner codes here means no institution-specific values are hardcoded.
            server: [{
                key: 'ethosApiKey',
                label: 'Ethos API Key',
                type: 'password',
                require: true
            }, {
                key: 'aidYear',
                label: 'Aid Year (RRRAREQ keyblckAidyCode, e.g. 2526)',
                type: 'text',
                require: true
            }, {
                key: 'texasGrantFundCodes',
                label: 'Texas Grant Fund Code(s) - comma separated (RPRAWRD fundCode)',
                type: 'text',
                require: true
            }, {
                key: 'attestationTreqCode',
                label: 'Attestation Requirement Code (RRRAREQ treqCode)',
                type: 'text',
                require: true
            }, {
                key: 'trstCodeYes',
                label: 'Status code when student attests YES (RRRAREQ trstCode)',
                type: 'text',
                require: true
            }, {
                key: 'trstCodeNo',
                label: 'Status code when student attests NO (RRRAREQ trstCode)',
                type: 'text',
                require: true
            }]
        }
    }]
}
