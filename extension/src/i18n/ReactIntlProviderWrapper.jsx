import { IntlProvider } from 'react-intl';
import PropTypes from 'prop-types';
import { getMessages } from './intlUtility';

export function withIntl(WrappedComponent) {
    function WithIntl(props) {
        const locale = props?.userInfo?.locale || 'en';

        return (
            <IntlProvider locale={locale} messages={getMessages(locale)}>
                <WrappedComponent {...props} />
            </IntlProvider>
        );
    }

    WithIntl.propTypes = {
        userInfo: PropTypes.object
    };
    WithIntl.displayName = `WithIntl(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return WithIntl;
}
