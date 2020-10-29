import React, { memo, useCallback, useMemo, useState } from 'react';
import { get, groupBy } from 'lodash';
import isEqual from 'react-fast-compare';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Arrow } from '@buffetjs/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Collapse } from 'reactstrap';
import pluginId from '../../pluginId';
import useEditView from '../../hooks/useEditView';
import FieldComponent from '../FieldComponent';
import NotAllowedInput from '../NotAllowedInput';
import connect from './utils/connect';
import select from './utils/select';
import BaselineAlignement from './BaselineAlignement';
import Button from './Button';
import ComponentsPicker from './ComponentsPicker';
import ComponentWrapper from './ComponentWrapper';
import DynamicZoneWrapper from './DynamicZoneWrapper';
import Label from './Label';
import RoundCTA from './RoundCTA';
import Wrapper from './Wrapper';
import CategoryItem from './CategoryItem';

/* eslint-disable react/no-array-index-key */

const DynamicZone = ({
  max,
  min,
  name,

  // Passed with the select function
  addComponentToDynamicZone,
  formErrors,
  isCreatingEntry,
  isFieldAllowed,
  isFieldReadable,
  layout,
  moveComponentUp,
  moveComponentDown,
  removeComponentFromDynamicZone,
  dynamicDisplayedComponents,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [categoryToOpen, setCategoryToOpen] = useState('');

  const { components } = useEditView();

  const getDynamicComponent = useCallback(
    componentUid => {
      const component = components.find(compo => compo.uid === componentUid);

      return component;
    },
    [components]
  );

  const getDynamicComponentSchemaData = useCallback(
    componentUid => {
      const { schema } = getDynamicComponent(componentUid);

      return schema;
    },
    [getDynamicComponent]
  );

  const getDynamicComponentInfos = useCallback(
    componentUid => {
      const {
        info: { icon, name },
      } = getDynamicComponentSchemaData(componentUid);

      return { icon, name };
    },
    [getDynamicComponentSchemaData]
  );

  const dynamicZoneErrors = useMemo(() => {
    return Object.keys(formErrors)
      .filter(key => {
        return key === name;
      })
      .map(key => formErrors[key]);
  }, [formErrors, name]);

  const dynamicZoneAvailableComponents = useMemo(
    () => get(layout, ['schema', 'attributes', name, 'components'], []),
    [layout, name]
  );

  const dynamicComponentCategories = useMemo(() => {
    const componentsWithInfos = dynamicZoneAvailableComponents.map(componentUid => {
      const {
        category,
        schema: { info },
      } = getDynamicComponent(componentUid);

      return { componentUid, category, info };
    });

    return groupBy(componentsWithInfos, 'category');
  }, [dynamicZoneAvailableComponents, getDynamicComponent]);

  const handleClickToggle = useCallback(
    categoryName => {
      const nextCategoryToOpen = categoryToOpen === categoryName ? '' : categoryName;

      setCategoryToOpen(nextCategoryToOpen);
    },
    [categoryToOpen]
  );

  const metas = useMemo(() => get(layout, ['metadatas', name, 'edit'], {}), [layout, name]);
  const dynamicDisplayedComponentsLength = dynamicDisplayedComponents.length;
  const missingComponentNumber = min - dynamicDisplayedComponentsLength;
  const hasError = dynamicZoneErrors.length > 0;
  const hasMinError =
    dynamicZoneErrors.length > 0 && get(dynamicZoneErrors, [0, 'id'], '').includes('min');

  const hasRequiredError = hasError && !hasMinError;
  const hasMaxError =
    hasError && get(dynamicZoneErrors, [0, 'id'], '') === 'components.Input.error.validation.max';

  if (!isFieldAllowed && isCreatingEntry) {
    return (
      <BaselineAlignement>
        <NotAllowedInput label={metas.label} spacerHeight="3px" />
      </BaselineAlignement>
    );
  }

  if (!isFieldAllowed && !isFieldReadable && !isCreatingEntry) {
    return (
      <BaselineAlignement>
        <NotAllowedInput label={metas.label} spacerHeight="3px" />
      </BaselineAlignement>
    );
  }

  return (
    <DynamicZoneWrapper>
      {dynamicDisplayedComponentsLength > 0 && (
        <Label>
          <p>{metas.label}</p>
          <p>{metas.description}</p>
        </Label>
      )}

      <ComponentWrapper>
        {dynamicDisplayedComponents.map((componentUid, index) => {
          const showDownIcon =
            isFieldAllowed &&
            dynamicDisplayedComponentsLength > 0 &&
            index < dynamicDisplayedComponentsLength - 1;
          const showUpIcon = isFieldAllowed && dynamicDisplayedComponentsLength > 0 && index > 0;

          return (
            <div key={index}>
              <div className="arrow-icons">
                {showDownIcon && (
                  <RoundCTA
                    className="arrow-btn arrow-down"
                    onClick={() => moveComponentDown(name, index)}
                  >
                    <Arrow />
                  </RoundCTA>
                )}
                {showUpIcon && (
                  <RoundCTA
                    className="arrow-btn arrow-up"
                    onClick={() => moveComponentUp(name, index)}
                  >
                    <Arrow />
                  </RoundCTA>
                )}
              </div>
              {isFieldAllowed && (
                <RoundCTA onClick={() => removeComponentFromDynamicZone(name, index)}>
                  <FontAwesomeIcon icon="trash-alt" />
                </RoundCTA>
              )}
              <FieldComponent
                componentUid={componentUid}
                componentFriendlyName={getDynamicComponentInfos(componentUid).name}
                icon={getDynamicComponentInfos(componentUid).icon}
                label=""
                name={`${name}.${index}`}
                isFromDynamicZone
              />
            </div>
          );
        })}
      </ComponentWrapper>
      {isFieldAllowed ? (
        <Wrapper>
          <Button
            type="button"
            hasError={hasError}
            className={isOpen && 'isOpen'}
            onClick={() => {
              if (dynamicDisplayedComponentsLength < max) {
                setIsOpen(prev => !prev);
              } else {
                strapi.notification.info(
                  `${pluginId}.components.notification.info.maximum-requirement`
                );
              }
            }}
          />
          {hasRequiredError && !isOpen && !hasMaxError && (
            <div className="error-label">
              <FormattedMessage id={`${pluginId}.components.DynamicZone.required`} />
            </div>
          )}
          {hasMaxError && !isOpen && (
            <div className="error-label">
              <FormattedMessage id="components.Input.error.validation.max" />
            </div>
          )}
          {hasMinError && !isOpen && (
            <div className="error-label">
              <FormattedMessage
                id={`${pluginId}.components.DynamicZone.missing${
                  missingComponentNumber > 1 ? '.plural' : '.singular'
                }`}
                values={{ count: missingComponentNumber }}
              />
            </div>
          )}
          <div className="info">
            <FormattedMessage
              id={`${pluginId}.components.DynamicZone.add-compo`}
              values={{ componentName: name }}
            />
          </div>
          <Collapse isOpen={isOpen}>
            <ComponentsPicker>
              <div>
                <p className="componentPickerTitle">
                  <FormattedMessage id={`${pluginId}.components.DynamicZone.pick-compo`} />
                </p>
                <div className="categoriesList">
                  {Object.keys(dynamicComponentCategories).map((categoryName, index) => {
                    const components = dynamicComponentCategories[categoryName];

                    return (
                      <CategoryItem
                        key={categoryName}
                        category={categoryName}
                        components={components}
                        isOpen={categoryToOpen === categoryName}
                        isFirst={index === 0}
                        onClickToggle={() => {
                          handleClickToggle(categoryName);
                        }}
                        onClickComponent={componentUid => {
                          setCategoryToOpen('');
                          const shouldCheckErrors = hasError;
                          addComponentToDynamicZone(name, componentUid, shouldCheckErrors);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </ComponentsPicker>
          </Collapse>
        </Wrapper>
      ) : (
        <BaselineAlignement top="9px" />
      )}
    </DynamicZoneWrapper>
  );
};

DynamicZone.defaultProps = {
  dynamicDisplayedComponents: [],
  max: Infinity,
  min: -Infinity,
};

DynamicZone.propTypes = {
  addComponentToDynamicZone: PropTypes.func.isRequired,
  dynamicDisplayedComponents: PropTypes.array,
  formErrors: PropTypes.object.isRequired,
  isCreatingEntry: PropTypes.bool.isRequired,
  isFieldAllowed: PropTypes.bool.isRequired,
  isFieldReadable: PropTypes.bool.isRequired,
  layout: PropTypes.object.isRequired,
  moveComponentUp: PropTypes.func.isRequired,
  moveComponentDown: PropTypes.func.isRequired,
  max: PropTypes.number,
  min: PropTypes.number,
  name: PropTypes.string.isRequired,
  removeComponentFromDynamicZone: PropTypes.func.isRequired,
};

const Memoized = memo(DynamicZone, isEqual);

export default connect(Memoized, select);

export { DynamicZone };
