import { useWebSocketProvider } from "wagmi";
import { ethers } from "ethers";
import contracts from "../contracts";
import { useQuery, useQueries } from "react-query";

export default function useMegapoolDetails(megapoolAddress) {
  let provider = useWebSocketProvider();
  let enabled =
    !!megapoolAddress &&
    megapoolAddress !== ethers.constants.AddressZero &&
    !!provider;

  // Query 1: Megapool metadata (~15 RPC calls, loads fast)
  let metadata = useQuery(
    ["MegapoolDetails", megapoolAddress],
    async () => {
      try {
        const mp = new ethers.Contract(
          megapoolAddress,
          contracts.RocketMegapoolDelegate.abi,
          provider?.signer || provider
        );
        // Sequential calls to be gentle on RPC rate limits.
        let validatorCount = await mp.getValidatorCount();
        let activeValidatorCount = await mp.getActiveValidatorCount();
        let exitingValidatorCount = await mp.getExitingValidatorCount();
        let lockedValidatorCount = await mp.getLockedValidatorCount();
        let nodeAddress = await mp.getNodeAddress();
        let nodeBond = await mp.getNodeBond();
        let nodeQueuedBond = await mp.getNodeQueuedBond();
        let debt = await mp.getDebt();
        let pendingRewards = await mp.getPendingRewards();
        let [nodeRewards, voterRewards, , rethRewards] =
          await mp.calculatePendingRewards();
        let userCapital = await mp.getUserCapital();
        let assignedValue = await mp.getAssignedValue();
        let refundValue = await mp.getRefundValue();
        let lastDistributionTime = await mp.getLastDistributionTime();
        let balance = await provider.getBalance(megapoolAddress);

        return {
          megapoolAddress,
          nodeAddress,
          validatorCount: validatorCount,
          activeValidatorCount,
          exitingValidatorCount,
          lockedValidatorCount,
          nodeBond: nodeBond.toHexString(),
          nodeQueuedBond: nodeQueuedBond.toHexString(),
          debt: debt.toHexString(),
          pendingRewards: pendingRewards.toHexString(),
          nodeRewards: nodeRewards.toHexString(),
          voterRewards: voterRewards.toHexString(),
          rethRewards: rethRewards.toHexString(),
          userCapital: userCapital.toHexString(),
          assignedValue: assignedValue.toHexString(),
          refundValue: refundValue.toHexString(),
          lastDistributionTime:
            typeof lastDistributionTime === "object"
              ? lastDistributionTime.toNumber()
              : Number(lastDistributionTime),
          balance: balance.toHexString(),
        };
      } catch (err) {
        console.warn(`Failed to load megapool metadata for ${megapoolAddress}`, err);
        throw err;
      }
    },
    {
      enabled,
    }
  );

  // Query 2: Individual validators (progressive, same pattern as useMinipoolDetails)
  let validatorCount = metadata.data?.validatorCount || 0;
  let loadingWindowBypassCount = 50;
  let loadingWindowMs = 25 * 1000;

  let validatorQueries = useQueries(
    Array.from({ length: validatorCount }, (_, i) => ({
      queryKey: ["MegapoolValidator", megapoolAddress, i],
      queryFn: async () => {
        if (i > loadingWindowBypassCount) {
          await new Promise((resolve) =>
            setTimeout(resolve, loadingWindowMs * Math.random())
          );
        }
        const mp = new ethers.Contract(
          megapoolAddress,
          contracts.RocketMegapoolDelegate.abi,
          provider?.signer || provider
        );
        let [info, pubkey] = await mp.getValidatorInfoAndPubkey(i);
        return {
          validatorId: i,
          pubkey,
          staked: info.staked,
          exited: info.exited,
          inQueue: info.inQueue,
          inPrestake: info.inPrestake,
          expressUsed: info.expressUsed,
          dissolved: info.dissolved,
          exiting: info.exiting,
          locked: info.locked,
          depositValue: info.depositValue,
          lastRequestedBond: info.lastRequestedBond,
          lastRequestedValue: info.lastRequestedValue,
          lastAssignmentTime: info.lastAssignmentTime,
          exitBalance:
            typeof info.exitBalance === "object"
              ? info.exitBalance.toNumber()
              : Number(info.exitBalance),
        };
      },
      enabled: enabled && validatorCount > 0,
    }))
  );

  let validators = validatorQueries
    .filter((q) => q.data)
    .map((q) => q.data);
  let validatorsLoading = validatorQueries.some((q) => q.isLoading);
  let validatorsLoadedCount = validators.length;

  return {
    data: metadata.data
      ? { ...metadata.data, validators }
      : undefined,
    isLoading: metadata.isLoading,
    validatorsLoading,
    validatorsLoadedCount,
    validatorsTotalCount: validatorCount,
  };
}
