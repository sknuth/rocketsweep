import { useState, useEffect } from "react";
import { ethers } from "ethers";
import SafeAppsSDK from "@safe-global/safe-apps-sdk";
import {
  distributeEncoded,
  claimEncoded,
  estimateMegapoolDistributeGas,
  estimateMegapoolClaimGas,
  bnSum,
} from "../utils";

export default function useMegapoolSweeper({
  megapoolAddress,
  megapoolDetails,
}) {
  let data = megapoolDetails?.data;

  // Distribute configuration
  let pendingRewards = data?.pendingRewards
    ? ethers.BigNumber.from(data.pendingRewards)
    : ethers.constants.Zero;
  let nodeRewards = data?.nodeRewards
    ? ethers.BigNumber.from(data.nodeRewards)
    : ethers.constants.Zero;
  let [isDistributing, setDistributing] = useState(!pendingRewards.isZero());

  useEffect(
    () => setDistributing(!pendingRewards.isZero()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pendingRewards.toString()]
  );

  // Claim configuration
  // After distribute, the node's share becomes claimable
  let [isClaiming, setClaiming] = useState(true);

  // Check for exiting validators (blocks distribute)
  let exitingCount = data?.exitingValidatorCount || 0;
  let canDistribute = exitingCount === 0;

  // Debt info
  let debt = data?.debt
    ? ethers.BigNumber.from(data.debt)
    : ethers.constants.Zero;

  // Gas estimates
  let gas = {
    distribute: estimateMegapoolDistributeGas(),
    claim: estimateMegapoolClaimGas(),
  };

  let overall = {
    eth: isDistributing ? nodeRewards : ethers.constants.Zero,
    gas: bnSum([
      isDistributing ? gas.distribute : ethers.constants.Zero,
      isClaiming ? gas.claim : ethers.constants.Zero,
    ]),
  };

  let execute = async () => {
    let sdk = new SafeAppsSDK();
    let txs = [];

    if (isDistributing) {
      txs.push({
        operation: "0x00",
        to: megapoolAddress,
        value: "0",
        data: distributeEncoded, // distribute() has same signature as fee distributor
      });
    }

    if (isClaiming) {
      txs.push({
        operation: "0x00",
        to: megapoolAddress,
        value: "0",
        data: claimEncoded,
      });
    }

    return sdk.txs.send({ txs });
  };

  return {
    execute,
    // Distribute config
    isDistributing,
    setDistributing,
    canDistribute,
    exitingCount,
    pendingRewards,
    nodeRewards,
    // Claim config
    isClaiming,
    setClaiming,
    // Debt
    debt,
    // Analysis
    gas,
    overall,
  };
}
