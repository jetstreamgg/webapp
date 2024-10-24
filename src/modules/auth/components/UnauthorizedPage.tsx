import React, { useMemo } from 'react';
import { Text } from '@/modules/layout/components/Typography';
import { Trans, t } from '@lingui/macro';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Unavailable } from '@/modules/icons';
import { ExternalLink } from '@/modules/layout/components/ExternalLink';
import { LoadingSpinner } from '@/modules/ui/components/LoadingSpinner';
import { sanitizeUrl } from '@/lib/utils';

type AuthData = {
  addressAllowed?: boolean;
  authIsLoading?: boolean;
  address?: string;
  authError: Error;
};

type VpnData = {
  isConnectedToVpn?: boolean;
  vpnIsLoading?: boolean;
  vpnError: Error;
};

type UnauthorizedPageProps = {
  authData: AuthData;
  vpnData: VpnData;
  children?: React.ReactNode;
};

const getTitle = (authData: AuthData, vpnData: VpnData): string => {
  if (vpnData.vpnError) {
    return t`Network Error`;
  }

  if (authData.authError) {
    return t`Address Verification Error`;
  }

  if (!vpnData.vpnIsLoading && vpnData.isConnectedToVpn && !vpnData.vpnError) {
    return t`VPN Detected`;
  }

  if (
    authData?.addressAllowed === false &&
    !authData.authIsLoading &&
    authData.address &&
    !authData.authError
  ) {
    return t`Access Restricted`;
  }

  return t`Network Error`;
};

const getMessage = (authData: AuthData, vpnData: VpnData, termsLink: any[]): string | React.ReactElement => {
  if (!vpnData.vpnIsLoading && vpnData.isConnectedToVpn && !vpnData.vpnError) {
    return t`Access via VPN is not permitted. Please disconnect your VPN and refresh the page to continue.`;
  }

  if (
    authData?.addressAllowed === false &&
    !authData.authIsLoading &&
    authData.address &&
    !authData.authError
  ) {
    return (
      <Trans>
        Your access is restricted. For more information, please refer to our{' '}
        {Array.isArray(termsLink) && termsLink.length > 0 ? (
          <ExternalLink
            skipConfirm
            className="text-textEmphasis"
            showIcon={false}
            href={sanitizeUrl(termsLink[0].url)}
          >
            {termsLink[0].name}
          </ExternalLink>
        ) : (
          'Terms of Use'
        )}
        .
      </Trans>
    );
  }

  return '';
};

export const UnauthorizedPage = ({ authData, vpnData, children }: UnauthorizedPageProps) => {
  let termsLink: any[] = [];
  try {
    termsLink = JSON.parse(import.meta.env.VITE_TERMS_LINK);
  } catch (error) {
    console.error('Error parsing terms link');
  }

  const isLoading = useMemo(
    () => authData.authIsLoading || vpnData.vpnIsLoading,
    [authData.authIsLoading, vpnData.vpnIsLoading]
  );

  return (
    <>
      <Dialog open={true}>
        {isLoading ? (
          <DialogContent className="max-w-[300px] bg-containerDark">
            <div className="flex items-center justify-center p-4">
              <Text className="mr-2 text-center text-text">
                <Trans>Please wait...</Trans>
              </Text>
              <LoadingSpinner />
            </div>
          </DialogContent>
        ) : (
          <DialogContent className="max-w-[640px] bg-containerDark p-10">
            <div className="flex flex-col gap-5 sm:flex-row">
              <Unavailable className="flex-shrink-0" />
              <div className="">
                <Text className="mb-2 text-[28px] text-text md:text-[32px]">
                  {getTitle(authData, vpnData)}
                </Text>
                <Text className="mb-10 font-graphik text-text">
                  {getMessage(authData, vpnData, termsLink)}
                </Text>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
      {children}
    </>
  );
};
