import Avatar from '@salesforce/design-system-react/components/avatar';
import Button from '@salesforce/design-system-react/components/button';
import Icon from '@salesforce/design-system-react/components/icon';
import Modal from '@salesforce/design-system-react/components/modal';
import Popover from '@salesforce/design-system-react/components/popover';
import Tooltip from '@salesforce/design-system-react/components/tooltip';
import classNames from 'classnames';
import i18n from 'i18next';
import React, { useCallback, useState } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ConnectModal from '@/components/user/connect';
import Logout from '@/components/user/logout';
import { ExternalLink, SpinnerWrapper, useIsMounted } from '@/components/utils';
import { ThunkDispatch } from '@/store';
import { disconnect, refreshDevHubStatus } from '@/store/user/actions';
import { User } from '@/store/user/reducer';
import { selectUserState } from '@/store/user/selectors';

const ConnectToSalesforce = ({
  toggleModal,
}: {
  toggleModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const openConnectModal = () => {
    toggleModal(true);
  };

  return (
    <>
      <Button
        label={i18n.t('Connect to Salesforce')}
        className="slds-text-body_regular slds-p-right_xx-small"
        variant="link"
        onClick={openConnectModal}
      />
      <Tooltip
        content={i18n.t(
          'Connection to a Salesforce org with Dev Hub enabled is required to create a Dev or Test scratch org.',
        )}
        position="overflowBoundaryElement"
        align="top right"
      />
    </>
  );
};

const ConnectionInfoWarning = () => (
  <Trans i18nKey="devHubNotEnabled">
    This Salesforce org does not have Dev Hub enabled or your user does not have
    permission to create scratch orgs. Learn how to{' '}
    <ExternalLink url="https://help.salesforce.com/articleView?id=sfdx_setup_enable_devhub.htm&type=0">
      enable Dev Hub
    </ExternalLink>
    .
  </Trans>
);

const UserInfo = ({
  user,
  onDisconnect = () => {},
}: {
  user: User;
  onDisconnect?: () => void;
}) => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMounted = useIsMounted();
  const dispatch = useDispatch<ThunkDispatch>();
  const doDisconnect = useCallback(() => {
    setIsDisconnecting(true);
    dispatch(disconnect()).finally(() => {
      onDisconnect();
      /* istanbul ignore else */
      if (isMounted.current) {
        setIsDisconnecting(false);
      }
    });
  }, [dispatch, isMounted, onDisconnect]);
  const doRefreshDevHubStatus = useCallback(() => {
    setIsRefreshing(true);
    dispatch(refreshDevHubStatus()).finally(() => {
      /* istanbul ignore else */
      if (isMounted.current) {
        setIsRefreshing(false);
      }
    });
  }, [dispatch, isMounted]);

  /* istanbul ignore if */
  if (user.uses_global_devhub) {
    return null;
  }

  return (
    <>
      {(isDisconnecting || isRefreshing) && <SpinnerWrapper />}
      <ul>
        <li>
          <strong>{i18n.t('Dev Hub:')}</strong>{' '}
          {user.is_devhub_enabled ? (
            <span className="slds-text-color_success">{i18n.t('Enabled')}</span>
          ) : (
            <>
              <span className="slds-text-color_error">
                {i18n.t('Not Enabled')}
              </span>
              {' | '}
              <Button
                label={i18n.t('Check Again')}
                variant="link"
                onClick={doRefreshDevHubStatus}
              />
            </>
          )}
        </li>
        {user.sf_username && (
          <li>
            <strong>{i18n.t('User:')}</strong> {user.sf_username}
          </li>
        )}
        {user.org_name && (
          <li>
            <strong>{i18n.t('Org:')}</strong> {user.org_name}
          </li>
        )}
        {user.org_type && (
          <li>
            <strong>{i18n.t('Type:')}</strong> {user.org_type}
          </li>
        )}
      </ul>
      {!user.devhub_username && (
        <Button
          label={i18n.t('Disconnect from Salesforce')}
          variant="link"
          className="slds-m-top_small"
          onClick={doDisconnect}
        />
      )}
    </>
  );
};

const ConnectionInfo = ({ user }: { user: User }) => (
  <>
    <Icon
      className="slds-is-absolute"
      category="utility"
      name="connected_apps"
      size="small"
    />
    <div className="slds-p-left_x-large slds-m-bottom_small">
      <p className="slds-text-heading_small">
        {i18n.t('Connected to Salesforce')}
      </p>
      {!user.is_devhub_enabled && (
        <p className="slds-text-color_weak slds-m-top_xx-small">
          <Icon
            assistiveText={{ label: i18n.t('Error') }}
            category="utility"
            name="error"
            colorVariant="error"
            size="x-small"
            className="slds-m-bottom_xxx-small"
            containerClassName="slds-m-right_xx-small"
          />
          <ConnectionInfoWarning />
        </p>
      )}
    </div>
    <UserInfo user={user} />
  </>
);

export const ConnectionInfoModal = ({
  user,
  isOpen,
  toggleModal,
  onDisconnect,
  successText,
}: {
  user: User;
  isOpen: boolean;
  toggleModal: (open: boolean) => void;
  onDisconnect?: () => void;
  successText?: string;
}) => {
  const handleClose = () => {
    toggleModal(false);
  };
  const isConnected = Boolean(
    user.valid_token_for || user.devhub_username || user.uses_global_devhub,
  );

  return (
    <Modal
      isOpen={isConnected && isOpen}
      heading={
        user.is_devhub_enabled
          ? i18n.t('Dev Hub Enabled')
          : i18n.t('Enable Dev Hub')
      }
      tagline={
        user.is_devhub_enabled ? (
          successText ||
          i18n.t('Please close this message and try your action again.')
        ) : (
          <ConnectionInfoWarning />
        )
      }
      prompt={user.is_devhub_enabled ? 'success' : 'warning'}
      footer={
        user.is_devhub_enabled && [
          <Button
            key="close"
            label={i18n.t('Continue')}
            onClick={handleClose}
          />,
        ]
      }
      onRequestClose={handleClose}
    >
      <div className="slds-p-vertical_medium slds-is-relative">
        <UserInfo user={user} onDisconnect={onDisconnect} />
      </div>
    </Modal>
  );
};

const UserDropdown = () => {
  const user = useSelector(selectUserState);
  const [modalOpen, setModalOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <>
      <Popover
        align="bottom right"
        body={
          <>
            <header
              className={classNames({
                'slds-border_bottom': !user.uses_global_devhub,
                'slds-p-bottom_x-small': !user.uses_global_devhub,
                'slds-m-bottom_x-small': !user.uses_global_devhub,
              })}
            >
              <div className="slds-p-vertical_small slds-p-horizontal_large">
                {user.avatar_url ? (
                  <div className="slds-is-absolute">
                    <Avatar
                      imgSrc={user.avatar_url}
                      imgAlt={`${i18n.t('avatar for user')} ${user.username}`}
                      title={user.username}
                      size="small"
                    />
                  </div>
                ) : (
                  <Icon
                    className="slds-is-absolute"
                    category="utility"
                    name="user"
                    size="small"
                  />
                )}
                <div className="slds-p-left_x-large">
                  <h2
                    id="user-info-heading"
                    className="slds-text-heading_small"
                  >
                    {user.username}
                  </h2>
                  <Logout className="slds-m-top_xx-small" />
                </div>
              </div>
            </header>
            {!user.uses_global_devhub && (
              <div className="slds-p-vertical_small slds-p-horizontal_large">
                {user.valid_token_for || user.devhub_username ? (
                  <ConnectionInfo user={user} />
                ) : (
                  <ConnectToSalesforce toggleModal={setModalOpen} />
                )}
              </div>
            )}
          </>
        }
        classNameBody="slds-p-horizontal_none"
        ariaLabelledby="user-info-heading"
        hasNoCloseButton
      >
        <Button
          variant="icon"
          label={
            <Avatar
              imgSrc={user.avatar_url}
              imgAlt={`${i18n.t('avatar for user')} ${user.username}`}
              title={user.username}
            />
          }
        />
      </Popover>
      {!user.uses_global_devhub && (
        <ConnectModal
          user={user}
          isOpen={modalOpen}
          toggleModal={setModalOpen}
        />
      )}
    </>
  );
};

export default UserDropdown;
