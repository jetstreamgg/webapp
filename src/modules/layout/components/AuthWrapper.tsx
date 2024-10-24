import { useRestrictedAddressCheck, useVpnCheck } from '@jetstreamgg/hooks';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useAccount, useAccountEffect } from 'wagmi';
import { UnauthorizedPage } from '../../auth/components/UnauthorizedPage';

// It needs to be inside the wagmi & rainbow provider to get the address from the hook
export const AuthWrapper = ({ children }: { children: ReactNode }) => {
  const [enabled, setEnabled] = useState(false);
  const { address } = useAccount();

  const skipAuthCheck = import.meta.env.VITE_SKIP_AUTH_CHECK === 'true';

  useAccountEffect({
    onConnect({ address }) {
      setEnabled(!!address);
    },
    onDisconnect() {
      setEnabled(false);
    }
  });

  const authUrl = import.meta.env.VITE_AUTH_URL || 'https://staging-api.sky.money';
  const {
    data: authData,
    isLoading: authIsLoading,
    error: authError
  } = useRestrictedAddressCheck({ address, authUrl, enabled });

  const { data: vpnData, isLoading: vpnIsLoading, error: vpnError } = useVpnCheck({ authUrl });
  const addressAllowed = authData?.addressAllowed;
  const isConnectedToVpn = vpnData?.isConnectedToVpn;

  // Check whether the user is in a restricted region,
  // but only flag to reload if the current build is unrestricted
  const isRestrictedRegion = useMemo(
    () => !vpnIsLoading && import.meta.env.VITE_RESTRICTED_BUILD !== 'true' && vpnData?.isRestrictedRegion,
    [vpnIsLoading, vpnData?.isRestrictedRegion]
  );

  // Reload page if build should be restricted, but isn't.
  // Since the user now appears to be in a restricted region, reloading
  // the page should serve them the correct build
  useEffect(() => {
    if (isRestrictedRegion) {
      // Add a slight delay to show message before reloading
      const timer = setTimeout(() => {
        window.location.reload();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isRestrictedRegion]);

  const isAllowed = useMemo(
    () =>
      // check if the user is using a VPN
      !isConnectedToVpn && // if the user is connected to a vpn, we don't care about the address
      // second, if user is connected, we must check if the address is allowed
      (!enabled || // if the address is not connected, we don't care about the address
        (enabled && // if address is connected, we need to check if it's allowed
          addressAllowed)) && // address must also be allowed
      // check if there are no errors
      !authError &&
      !vpnError,
    [authIsLoading, vpnIsLoading, isConnectedToVpn, addressAllowed, enabled, authError, vpnError]
  );

  const isAuthorized = isAllowed || skipAuthCheck;

  return isAuthorized ? (
    <>{children}</>
  ) : (
    <UnauthorizedPage
      authData={{ addressAllowed, authIsLoading, address, authError }}
      vpnData={{ isConnectedToVpn, vpnIsLoading, vpnError }}
    >
      {children}
    </UnauthorizedPage>
  );
};
