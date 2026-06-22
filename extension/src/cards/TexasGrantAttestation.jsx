// Copyright 2025 Ellucian Company L.P. and its affiliates.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { colorFillAlertError } from '@ellucian/react-design-system/core/styles/tokens';

import { withIntl } from '../i18n/ReactIntlProviderWrapper';

import { useCardInfo, useData, useExtensionControl } from '@ellucian/experience-extension-utils';

import { DataQueryProvider, userTokenDataConnectQuery, useDataQuery } from '@ellucian/experience-extension-extras';

import { useDashboard } from '../hooks/dashboard';

import AttestationView from './AttestationView';
import { recordAttestation } from '../data/attestation';
import { USE_MOCK, getMockAttestation, recordMockAttestation } from '../data/mock';

// The GET pipeline may return a single object or an array with one element.
function normalize(data) {
    if (Array.isArray(data)) {
        return data[0];
    }
    return data;
}

// Live container - talks to Banner through the Data Connect pipelines via the SDK.
function TexasGrantAttestationLive() {
    const intl = useIntl();
    const { setErrorMessage } = useExtensionControl();
    const { authenticatedEthosFetch } = useData();
    const { serverConfigContext: { cardPrefix }, cardId } = useCardInfo();

    useDashboard();

    const { data, dataError, inPreviewMode, isError, isLoading, refresh } =
        useDataQuery(process.env.PIPELINE_GET_TEXAS_GRANT_ATTESTATION);

    const attestation = useMemo(() => normalize(data), [data]);

    useEffect(() => {
        if (isError) {
            setErrorMessage({
                headerMessage: intl.formatMessage({ id: 'TexasGrant.contactAdministrator' }),
                textMessage: intl.formatMessage({ id: 'TexasGrant.dataError' }),
                iconName: 'warning',
                iconColor: colorFillAlertError
            });
        }
    }, [intl, isError, setErrorMessage]);

    const onRecord = useCallback(async (answer) => {
        const result = await recordAttestation({ authenticatedEthosFetch, cardId, cardPrefix, answer });
        refresh();
        return result;
    }, [authenticatedEthosFetch, cardId, cardPrefix, refresh]);

    return (
        <AttestationView
            attestation={attestation}
            isLoading={isLoading}
            dataError={dataError}
            inPreviewMode={inPreviewMode}
            onRecord={onRecord}
        />
    );
}

function TexasGrantAttestationLiveWithProviders() {
    const options = useMemo(() => ({
        queryFunction: userTokenDataConnectQuery,
        resource: process.env.PIPELINE_GET_TEXAS_GRANT_ATTESTATION
    }), []);

    return (
        <DataQueryProvider options={options}>
            <TexasGrantAttestationLive />
        </DataQueryProvider>
    );
}

// Mock container - fully offline, no SDK data hooks. Used when USE_MOCK_DATA=true.
function TexasGrantAttestationMock() {
    const [ attestation, setAttestation ] = useState(() => getMockAttestation());

    const onRecord = useCallback(async (answer) => {
        const result = await recordMockAttestation({ answer });
        setAttestation(getMockAttestation());
        return result;
    }, []);

    return (
        <AttestationView
            attestation={attestation}
            isLoading={false}
            dataError={undefined}
            inPreviewMode={false}
            onRecord={onRecord}
        />
    );
}

export default withIntl(USE_MOCK ? TexasGrantAttestationMock : TexasGrantAttestationLiveWithProviders);
