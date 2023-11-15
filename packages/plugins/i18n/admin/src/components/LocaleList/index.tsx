import * as React from 'react';

import { Button, ContentLayout, EmptyStateLayout, HeaderLayout, Main } from '@strapi/design-system';
import { useFocusWhenNavigate } from '@strapi/helper-plugin';
import { EmptyDocuments, Plus } from '@strapi/icons';
import { useIntl } from 'react-intl';

import useLocales from '../../hooks/useLocales';
import { getTranslation } from '../../utils';
import ModalCreate from '../ModalCreate';
import ModalDelete from '../ModalDelete';
import ModalEdit from '../ModalEdit';

import LocaleTable from './LocaleTable';

type LocaleListProps = {
  canUpdateLocale: boolean;
  canDeleteLocale: boolean;
  onToggleCreateModal?: () => void;
  isCreating: boolean;
};

const LocaleList = ({
  canUpdateLocale,
  canDeleteLocale,
  onToggleCreateModal = () => {},
  isCreating,
}: LocaleListProps) => {
  const [localeToDelete, setLocaleToDelete] = React.useState<{
    id: number;
  }>();
  const [localeToEdit, setLocaleToEdit] = React.useState();
  const { locales } = useLocales();
  const { formatMessage } = useIntl();

  useFocusWhenNavigate();

  // Delete actions
  const closeModalToDelete = () => setLocaleToDelete(undefined);
  const handleDeleteLocale = canDeleteLocale ? setLocaleToDelete : undefined;

  // Edit actions
  const closeModalToEdit = () => setLocaleToEdit(undefined);
  const handleEditLocale = canUpdateLocale ? setLocaleToEdit : undefined;

  return (
    <Main tabIndex={-1}>
      <HeaderLayout
        primaryAction={
          <Button startIcon={<Plus />} onClick={onToggleCreateModal} size="S">
            {formatMessage({ id: getTranslation('Settings.list.actions.add') })}
          </Button>
        }
        title={formatMessage({ id: getTranslation('plugin.name') })}
        subtitle={formatMessage({ id: getTranslation('Settings.list.description') })}
      />
      <ContentLayout>
        {locales?.length > 0 ? (
          <LocaleTable
            locales={locales}
            onDeleteLocale={handleDeleteLocale}
            onEditLocale={handleEditLocale}
          />
        ) : (
          <EmptyStateLayout
            icon={<EmptyDocuments width={undefined} height={undefined} />}
            content={formatMessage({ id: getTranslation('Settings.list.empty.title') })}
            action={
              onToggleCreateModal ? (
                <Button variant="secondary" startIcon={<Plus />} onClick={onToggleCreateModal}>
                  {formatMessage({ id: getTranslation('Settings.list.actions.add') })}
                </Button>
              ) : null
            }
          />
        )}
      </ContentLayout>

      {isCreating && <ModalCreate onClose={onToggleCreateModal} />}
      {localeToEdit && <ModalEdit onClose={closeModalToEdit} locale={localeToEdit} />}
      {localeToDelete && (
        <ModalDelete localeToDelete={localeToDelete} onClose={closeModalToDelete} />
      )}
    </Main>
  );
};

export default LocaleList;
