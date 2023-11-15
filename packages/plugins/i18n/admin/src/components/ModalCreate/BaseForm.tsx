import { useCallback } from 'react';

import { Grid, GridItem, TextInput } from '@strapi/design-system';
import { useFormikContext } from 'formik';
import { useIntl } from 'react-intl';

import { getTranslation } from '../../utils';
import LocaleSelect from '../LocaleSelect';

const BaseForm = () => {
  const { formatMessage } = useIntl();
  const { values, handleChange, setFieldValue, errors } = useFormikContext<{
    displayName: string;
    code: string;
  }>();

  /**
   * This is needed because the LocaleSelect component is a memoized component
   * since it renders ~500 locales and that formik would trigger a re-render on it without
   * it
   */
  const handleLocaleChange = useCallback(
    (nextLocale: { displayName: string; code: string }) => {
      setFieldValue('displayName', nextLocale.displayName);
      setFieldValue('code', nextLocale.code);
    },
    [setFieldValue]
  );

  /**
   * This is needed because the LocaleSelect component is a memoized component
   * since it renders ~500 locales and that formik would trigger a re-render on it without
   * it
   */
  const handleClear = useCallback(() => {
    setFieldValue('displayName', '');
    setFieldValue('code', '');
  }, [setFieldValue]);

  return (
    <Grid gap={4}>
      <GridItem col={6}>
        <LocaleSelect
          error={errors.code}
          value={values.code}
          onLocaleChange={handleLocaleChange}
          onClear={handleClear}
        />
      </GridItem>

      <GridItem col={6}>
        <TextInput
          name="displayName"
          label={formatMessage({
            id: getTranslation('Settings.locales.modal.locales.displayName'),
            defaultMessage: 'Locale display name',
          })}
          hint={formatMessage({
            id: getTranslation('Settings.locales.modal.locales.displayName.description'),
            defaultMessage: 'Locale will be displayed under that name in the administration panel',
          })}
          error={
            errors.displayName
              ? formatMessage({
                  id: getTranslation('Settings.locales.modal.locales.displayName.error'),
                  defaultMessage: 'The locale display name can only be less than 50 characters.',
                })
              : undefined
          }
          value={values.displayName}
          onChange={handleChange}
        />
      </GridItem>
    </Grid>
  );
};

export default BaseForm;
