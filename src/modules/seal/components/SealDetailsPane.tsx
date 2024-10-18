import { useContext, useMemo } from 'react';
import { ConfigContext } from '@/modules/config/context/ConfigContext';
import { SealOverview } from './SealOverview';
import { SealPositionDetails } from './SealPositionDetails';
import { ActiveSealDetailsView } from '../constants';

export function SealDetailsPane() {
  const { selectedSealUrnIndex } = useContext(ConfigContext);
  const view = useMemo(
    () =>
      selectedSealUrnIndex !== undefined ? ActiveSealDetailsView.DETAILS : ActiveSealDetailsView.OVERVIEW,
    [selectedSealUrnIndex]
  );

  return view === ActiveSealDetailsView.DETAILS ? (
    <SealPositionDetails positionIndex={selectedSealUrnIndex} />
  ) : (
    <SealOverview />
  );
}
