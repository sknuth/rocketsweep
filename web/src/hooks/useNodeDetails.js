import useK from "./useK";
import { ethers } from "ethers";

export default function useNodeDetails({ nodeAddress }) {
  let { data: exists, isLoading: l1 } =
    useK.RocketNodeManager.Read.getNodeExists({
      args: [nodeAddress],
      enabled: !!nodeAddress,
      onError: () => {},
    });

  let { data: withdrawalAddress, isLoading: l2 } =
    useK.RocketNodeManager.Read.getNodeWithdrawalAddress({
      args: [nodeAddress],
      enabled: !!nodeAddress && exists === true,
      onError: () => {},
    });

  let { data: feeDistributorInitialised, isLoading: l3 } =
    useK.RocketNodeManager.Read.getFeeDistributorInitialised({
      args: [nodeAddress],
      enabled: !!nodeAddress && exists === true,
      onError: () => {},
    });

  let { data: smoothingPoolRegistrationState, isLoading: l4 } =
    useK.RocketNodeManager.Read.getSmoothingPoolRegistrationState({
      args: [nodeAddress],
      enabled: !!nodeAddress && exists === true,
      onError: () => {},
    });

  // Fee distributor address is resolved from the factory contract, not RocketNodeManager
  let { data: feeDistributorAddress, isLoading: l5 } =
    useK.RocketNodeDistributorFactory.Read.getProxyAddress({
      args: [nodeAddress],
      enabled: !!nodeAddress && exists === true,
      onError: () => {},
    });

  let isLoading = l1 || l2 || l3 || l4 || l5;

  // Assemble a compatible object matching the old getNodeDetails return shape.
  // We must provide defaults for ALL fields from the original struct, because
  // consumers destructure `details || { fallback }` — if `data` is defined
  // but a field is missing, the fallback object is never used and the field
  // is undefined, causing BigNumber.from(undefined) crashes.
  //
  // Fields like rplStake, minimumRPLStake, ethMatched have moved to
  // RocketNodeStaking and default to Zero here.
  let data =
    exists !== undefined
      ? {
          // Fields resolved from individual getters
          exists: exists || false,
          withdrawalAddress:
            withdrawalAddress || ethers.constants.AddressZero,
          feeDistributorAddress:
            feeDistributorAddress || ethers.constants.AddressZero,
          feeDistributorInitialised: feeDistributorInitialised || false,
          smoothingPoolRegistrationState:
            smoothingPoolRegistrationState || false,
          // Address fields defaulting to AddressZero
          pendingWithdrawalAddress: ethers.constants.AddressZero,
          nodeAddress: nodeAddress || ethers.constants.AddressZero,
          // BigNumber fields defaulting to Zero (moved to RocketNodeStaking)
          registrationTime: ethers.constants.Zero,
          rewardNetwork: ethers.constants.Zero,
          rplStake: ethers.constants.Zero,
          effectiveRPLStake: ethers.constants.Zero,
          minimumRPLStake: ethers.constants.Zero,
          maximumRPLStake: ethers.constants.Zero,
          ethMatched: ethers.constants.Zero,
          ethMatchedLimit: ethers.constants.Zero,
          minipoolCount: ethers.constants.Zero,
          balanceETH: ethers.constants.Zero,
          balanceRETH: ethers.constants.Zero,
          balanceRPL: ethers.constants.Zero,
          balanceOldRPL: ethers.constants.Zero,
          depositCreditBalance: ethers.constants.Zero,
          distributorBalanceUserETH: ethers.constants.Zero,
          distributorBalanceNodeETH: ethers.constants.Zero,
          smoothingPoolRegistrationChanged: ethers.constants.Zero,
          // String fields
          timezoneLocation: "",
        }
      : undefined;

  return { data, isLoading };
}
