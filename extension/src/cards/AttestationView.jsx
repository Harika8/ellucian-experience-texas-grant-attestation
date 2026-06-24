// Presentational view - no SDK data/network hooks, so it renders in the live
// Experience runtime, the offline mock path, AND the standalone React+EDS harness.
// Data and the record callback come in as props.

import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import {
    Button,
    CircularProgress,
    FormControl,
    FormControlLabel,
    makeStyles,
    Radio,
    RadioGroup,
    Snackbar,
    Typography
} from '@ellucian/react-design-system/core';
import {
    colorFillAlertError,
    spacing20,
    spacing40,
    spacing80
} from '@ellucian/react-design-system/core/styles/tokens';

const useStyles = makeStyles()(() => ({
    root: {
        height: '100%'
    },
    content: {
        height: '100%',
        marginRight: spacing40,
        marginBottom: spacing40,
        marginLeft: spacing40,
        display: 'flex',
        flexDirection: 'column'
    },
    contentMessage: {
        height: '100%',
        marginRight: spacing80,
        marginLeft: spacing80,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    message: {
        textAlign: 'center'
    },
    instructions: {
        marginTop: spacing40,
        marginBottom: spacing20
    },
    statement: {
        marginTop: spacing20,
        marginBottom: spacing40,
        fontWeight: 'bold'
    },
    recorded: {
        marginTop: spacing40,
        color: colorFillAlertError
    },
    recordedConfirmed: {
        marginTop: spacing40
    },
    submitBox: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: spacing40
    },
    spinnerBox: {
        height: '100%',
        flex: '1 0 70%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    busyBox: {
        height: '100%',
        width: '100%',
        flex: '1 0 70%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: '0'
    }
}));

export default function AttestationView({ attestation, isLoading, dataError, inPreviewMode, onRecord }) {
    const intl = useIntl();
    const { classes } = useStyles();

    const [ selectedAnswer, setSelectedAnswer ] = useState();
    const [ showSnackbar, setShowSnackbar ] = useState(false);
    const [ snackMessage, setSnackMessage ] = useState();
    const [ busy, setBusy ] = useState(false);
    // Set only when the student submits during this session, so we can show a
    // one-time read-only confirmation. On any later load (a fresh mount) this is
    // false and an already-recorded response hides the card entirely.
    const [ justSubmitted, setJustSubmitted ] = useState(false);

    // Seed the radio selection with any previously recorded answer
    useEffect(() => {
        if (attestation && typeof attestation.currentAnswer === 'boolean') {
            setSelectedAnswer(attestation.currentAnswer ? 'yes' : 'no');
        }
    }, [attestation]);

    const showSnackbarMessage = useCallback(message => {
        setShowSnackbar(true);
        setSnackMessage(message);
    }, []);

    const onSubmit = useCallback(async () => {
        if (selectedAnswer !== 'yes' && selectedAnswer !== 'no') {
            showSnackbarMessage(intl.formatMessage({ id: 'TexasGrant.selectAnswer' }));
            return;
        }

        setBusy(true);
        const result = await onRecord(selectedAnswer === 'yes');
        if (result?.status === 'success') {
            setJustSubmitted(true);
            showSnackbarMessage(intl.formatMessage({ id: 'TexasGrant.saveSuccess' }));
        } else {
            showSnackbarMessage(intl.formatMessage({ id: 'TexasGrant.saveError' }));
        }
        setBusy(false);
    }, [intl, onRecord, selectedAnswer, showSnackbarMessage]);

    const onChangeAnswer = useCallback((event) => {
        setSelectedAnswer(event.target.value);
    }, []);

    const showSpinning = !attestation && isLoading;
    const showNotConfigured = !attestation && inPreviewMode && dataError?.statusCode === 404;

    if (showNotConfigured) {
        return (
            <div className={classes.root}>
                <div className={classes.contentMessage}>
                    <Typography className={classes.message} variant="body1" component="div">
                        {intl.formatMessage({ id: 'TexasGrant.notConfigured' })}
                    </Typography>
                </div>
            </div>
        );
    }

    if (showSpinning) {
        return (
            <div className={classes.spinnerBox}>
                <div>
                    <CircularProgress />
                </div>
            </div>
        );
    }

    // Visibility rules - the card only appears for an eligible student who has not
    // yet submitted:
    //   - ineligible (no Texas grant)        -> render nothing
    //   - already submitted (on a fresh load) -> render nothing (prevents erroneous
    //                                            re-submission; the answer is final)
    //   - just submitted in this session      -> read-only confirmation, no form
    //   - eligible and not yet submitted      -> the attestation form
    // The Experience SDK has no runtime "remove this card" API, so "render nothing"
    // is the available mechanism. For guaranteed non-delivery, also gate the card to
    // a role/group of eligible, not-yet-submitted students in Experience Setup.
    if (!attestation || !attestation.eligible) {
        return null;
    }

    const alreadyRecorded = typeof attestation.currentAnswer === 'boolean';

    if (alreadyRecorded && !justSubmitted) {
        return null;
    }

    if (justSubmitted) {
        return (
            <div className={classes.root}>
                <div className={classes.content}>
                    <Typography className={classes.instructions} variant="body1" component="div">
                        {intl.formatMessage({ id: 'TexasGrant.thankYou' })}
                    </Typography>
                    <Typography
                        className={attestation.currentAnswer ? classes.recordedConfirmed : classes.recorded}
                        variant="body1"
                        component="div"
                    >
                        {intl.formatMessage({
                            id: attestation.currentAnswer ? 'TexasGrant.recordedYes' : 'TexasGrant.recordedNo'
                        })}
                        {attestation.statDate && (
                            ' ' + intl.formatMessage(
                                { id: 'TexasGrant.recorded' },
                                { date: intl.formatDate(attestation.statDate) }
                            )
                        )}
                    </Typography>
                </div>
                <Snackbar
                    open={showSnackbar}
                    message={snackMessage}
                    onClose={() => { setShowSnackbar(false); }}
                />
            </div>
        );
    }

    return (
        <div className={classes.root}>
            <div className={classes.content}>
                <Typography className={classes.instructions} variant="body1" component="div">
                    {intl.formatMessage({ id: 'TexasGrant.instructions' })}
                </Typography>
                <Typography className={classes.statement} variant="body1" component="div" style={{ fontWeight: 600 }}>
                    {intl.formatMessage({ id: 'TexasGrant.statement' })}
                </Typography>

                <FormControl component="fieldset">
                    <RadioGroup
                        aria-label={intl.formatMessage({ id: 'TexasGrant.statement' })}
                        name="texas-grant-attestation"
                        value={selectedAnswer || ''}
                        onChange={onChangeAnswer}
                    >
                        <FormControlLabel
                            value="yes"
                            control={<Radio />}
                            label={intl.formatMessage({ id: 'TexasGrant.answerYes' })}
                        />
                        <FormControlLabel
                            value="no"
                            control={<Radio />}
                            label={intl.formatMessage({ id: 'TexasGrant.answerNo' })}
                        />
                    </RadioGroup>
                </FormControl>

                <div className={classes.submitBox}>
                    <Button color="primary" onClick={onSubmit}>
                        {intl.formatMessage({ id: 'TexasGrant.submit' })}
                    </Button>
                </div>
            </div>

            <Snackbar
                open={showSnackbar}
                message={snackMessage}
                onClose={() => { setShowSnackbar(false); }}
            />

            {busy && (
                <div
                    className={classes.busyBox}
                    onClick={(event) => { event.stopPropagation(); }}
                    onKeyUp={(event) => { event.stopPropagation(); }}
                    role="button"
                    tabIndex={0}
                >
                    <CircularProgress />
                </div>
            )}
        </div>
    );
}

AttestationView.propTypes = {
    attestation: PropTypes.object,
    isLoading: PropTypes.bool,
    dataError: PropTypes.object,
    inPreviewMode: PropTypes.bool,
    onRecord: PropTypes.func.isRequired
};

