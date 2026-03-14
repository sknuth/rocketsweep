import useK from "./useK";

export default function useDepositPoolStatus() {
  let { data: balance, isLoading: isLoadingBalance } =
    useK.RocketDepositPool.Read.getBalance({
      onError: () => {},
    });
  let { data: nodeBalance, isLoading: isLoadingNode } =
    useK.RocketDepositPool.Read.getNodeBalance({
      onError: () => {},
    });
  let { data: userBalance, isLoading: isLoadingUser } =
    useK.RocketDepositPool.Read.getUserBalance({
      onError: () => {},
    });

  return {
    balance, // Total ETH in deposit pool (BigNumber)
    nodeBalance, // Node operator ETH in pool (BigNumber)
    userBalance, // User/rETH ETH in pool (BigNumber, can be negative)
    isLoading: isLoadingBalance || isLoadingNode || isLoadingUser,
  };
}
