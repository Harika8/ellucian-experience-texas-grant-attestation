// Standalone harness entry. Renders the real AttestationView (Ellucian Design
// System components) with an in-page mock data layer and simple controls, so the
// card can be seen and clicked in a plain browser - no Experience tenant, no Ethos,
// no Data Connect.

import { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { EDSApplication } from '@ellucian/react-design-system/core';

import AttestationView from '../src/cards/AttestationView';
import { withIntl } from '../src/i18n/ReactIntlProviderWrapper';

const today = () => new Date().toISOString().slice(0, 10);

// Wrap the view in the intl provider (as the real card does).
const Card = withIntl(function StandaloneCard({ eligible, recorded, onRecord }) {
    const attestation = {
        eligible,
        bannerId: 'MOCK00001',
        aidYear: '2526',
        currentAnswer: recorded ? recorded.answer : null,
        statDate: recorded ? recorded.date : null
    };
    return (
        <AttestationView
            attestation={attestation}
            isLoading={false}
            inPreviewMode={false}
            onRecord={onRecord}
        />
    );
});

// Optional deep-link params (also used to capture per-state screenshots):
//   ?bare=1                 render only the card tile (no surrounding chrome)
//   ?eligible=false         ineligible student (card hidden)
//   ?recorded=yes|no        start with a prior recorded response
//   ?auto=submit-yes|submit-no   auto-select and submit on load (shows confirmation)
const params = new URLSearchParams(window.location.search);
const BARE = params.get('bare') === '1';
const INITIAL_ELIGIBLE = params.get('eligible') !== 'false';
const recordedParam = (params.get('recorded') || '').toLowerCase();
const INITIAL_RECORDED = recordedParam === 'yes'
    ? { answer: true, date: today() }
    : recordedParam === 'no'
        ? { answer: false, date: today() }
        : null;
const AUTO = (params.get('auto') || '').toLowerCase();

function App() {
    const [ eligible, setEligible ] = useState(INITIAL_ELIGIBLE);
    const [ recorded, setRecorded ] = useState(INITIAL_RECORDED); // { answer, date } | null - the "RRAAREQ row"
    const [ mountKey, setMountKey ] = useState(0);     // bump to remount the card (fresh dashboard load)

    const onRecord = useCallback(async (answer) => {
        await new Promise(resolve => setTimeout(resolve, 400)); // simulate the POST to Banner
        setRecorded({ answer, date: today() });
        return { status: 'success' };
    }, []);

    // Auto-submit for deep links / screenshots - drives the real submit flow.
    useEffect(() => {
        if (AUTO !== 'submit-yes' && AUTO !== 'submit-no') return;
        const value = AUTO === 'submit-no' ? 'no' : 'yes';
        const t1 = setTimeout(() => {
            const radio = document.querySelector(`input[type=radio][value="${value}"]`);
            if (radio) radio.click();
            const t2 = setTimeout(() => {
                const btn = [...document.querySelectorAll('.MuiButtonBase-root')].find(b => /submit/i.test(b.textContent));
                if (btn) btn.click();
            }, 200);
            return () => clearTimeout(t2);
        }, 200);
        return () => clearTimeout(t1);
    }, []);

    const card = (
        <div className="tile">
            <div className="tile-head"><i className="dot" /><span>Texas Grant Attestation</span></div>
            <div className="tile-body">
                <Card key={mountKey} eligible={eligible} recorded={recorded} onRecord={onRecord} />
            </div>
        </div>
    );

    if (BARE) {
        return <div className="bare">{card}</div>;
    }

    const state = !eligible
        ? 'Hidden (not a Texas grant recipient)'
        : recorded
            ? 'Hidden on next load (already submitted - final)'
            : 'Attestation form';

    return (
        <div className="layout">
            <div>
                <h1>Texas Grant Attestation</h1>
                <p className="sub">Real Ellucian Design System card, rendered standalone with a mock data layer.</p>
                {card}
            </div>

            <div className="panel">
                <h2>Simulate</h2>
                <label className="ctl">
                    <span>Student awarded a Texas grant</span>
                    <input type="checkbox" checked={eligible} onChange={e => setEligible(e.target.checked)} />
                </label>
                <label className="ctl">
                    <span>Has a prior recorded response</span>
                    <input
                        type="checkbox"
                        checked={!!recorded}
                        onChange={e => setRecorded(e.target.checked ? { answer: true, date: today() } : null)}
                    />
                </label>
                <button className="reload" onClick={() => setMountKey(k => k + 1)}>
                    &#x21bb; Reload card (fresh dashboard load)
                </button>
                <p className="state">Computed: <b>{state}</b></p>
                <p className="note">
                    The card shows only for an eligible student with no recorded response. After you submit, it shows a
                    one-time confirmation; click &ldquo;Reload card&rdquo; to see it hidden on the next load.
                </p>
            </div>
        </div>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(
    <EDSApplication>
        <App />
    </EDSApplication>
);

