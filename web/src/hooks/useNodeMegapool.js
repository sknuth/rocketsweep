import useK from "./useK";
import { ethers } from "ethers";

export default function useNodeMegapool(nodeAddress) {
  let { data: isDeployed, isLoading: isDeployedLoading } =
    useK.RocketMegapoolFactory.Read.getMegapoolDeployed({
      args: [nodeAddress],
      enabled: !!nodeAddress,
      onError: () => {},
    });
  let { data: megapoolAddress, isLoading: isAddressLoading } =
    useK.RocketMegapoolFactory.Read.getExpectedAddress({
      args: [nodeAddress],
      enabled: !!nodeAddress && isDeployed === true,
      onError: () => {},
    });
  return {
    hasMegapool:
      !!isDeployed &&
      !!megapoolAddress &&
      megapoolAddress !== ethers.constants.AddressZero,
    megapoolAddress: megapoolAddress || null,
    isLoading: isDeployedLoading || isAddressLoading,
  };
}
