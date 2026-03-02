import useFetchJSONZST from "./useFetchJSONZST";
import useSetting from "./useSetting";

// Use jsdelivr CDN to access the official Rocket Pool Merkle trees repo with proper CORS headers.
const fallbackBase =
  "https://cdn.jsdelivr.net/gh/rocket-pool/rewards-trees@main";

export default function useFetchRewardSnapshots({
  snapshots,
  network = "mainnet",
}) {
  let [ipfsBase] = useSetting("ipfs.base");
  let snapshotJsons = useFetchJSONZST(
    (snapshots || []).map(({ rewardIndex, merkleTreeCID }) => ({
      sourceUrls: [
        // NOTE: IPFS dumps aren't being published reliably anymore so we use the fallback instead.
        // `${ipfsBase}/ipfs/${merkleTreeCID}/rp-rewards-${network}-${rewardIndex}.json.zst`,
        `${fallbackBase}/${network}/rp-rewards-${network}-${rewardIndex}.json`,
      ],
    })),
    {
      enabled: !!ipfsBase,
      cacheTime: Math.Infinite,
      staleTime: Math.Infinite,
    }
  );
  return (snapshots || []).map((snapshot, i) => ({
    ...snapshot,
    data: snapshotJsons[i]?.data,
  }));
}
