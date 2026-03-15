import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { HelpOutline, OpenInNew } from "@mui/icons-material";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import CurrencyValue from "./CurrencyValue";
import { GasInfo } from "./GasInfoFooter";
import useGasPrice from "../hooks/useGasPrice";
import useCanConnectedAccountWithdraw from "../hooks/useCanConnectedAccountWithdraw";
import useCouldBeSafeContract from "../hooks/useCouldBeSafeContract";
import useNodeDetails from "../hooks/useNodeDetails";
import SafeIcon from "./SafeIcon";
import { safeAppUrl } from "../utils";

function useNodeWithdrawalAddress(nodeAddress) {
  let { data } = useNodeDetails({ nodeAddress });
  return data?.withdrawalAddress;
}

function MegapoolSafeAlert({ sx, nodeAddress }) {
  let { connector } = useAccount();
  let withdrawalAddress = useNodeWithdrawalAddress(nodeAddress);
  let hasSafeWithdrawalAddress = useCouldBeSafeContract(withdrawalAddress);
  let hasSafeNodeAddress = useCouldBeSafeContract(nodeAddress);
  let safeAddress = hasSafeWithdrawalAddress
    ? withdrawalAddress
    : hasSafeNodeAddress
    ? nodeAddress
    : null;
  if (!safeAddress) {
    return null;
  }
  if (connector?.id === "safe") {
    return null;
  }
  return (
    <Alert
      severity="warning"
      sx={sx}
      size={"small"}
      action={
        <Button
          variant="outlined"
          size="small"
          color="primary"
          startIcon={<SafeIcon />}
          endIcon={<OpenInNew />}
          href={safeAppUrl({ safeAddress })}
        >
          Open
        </Button>
      }
    >
      Open as a Safe App to enable Megapool Sweep
    </Alert>
  );
}

function ReceiptsInfo({
  sx,
  size = "small",
  amountEth = ethers.constants.Zero,
  amountGas,
}) {
  const gasPrice = useGasPrice();
  const gasCostEth = gasPrice.mul(amountGas);
  return (
    <Stack
      sx={sx}
      direction="row"
      alignItems="baseline"
      justifyContent="space-between"
    >
      <Stack direction="column">
        <Stack direction="row" spacing={1} justifyContent="space-between">
          <CurrencyValue
            value={amountEth.sub(gasCostEth)}
            currency="eth"
            placeholder="0"
            size={size}
          />
        </Stack>
        <Typography variant="caption" color="text.disabled">
          receipts (after gas)
        </Typography>
      </Stack>
      <GasInfo size={size} gasAmount={amountGas} />
    </Stack>
  );
}

function SweepCardContent({ sweeper }) {
  let {
    isDistributing,
    setDistributing,
    canDistribute,
    exitingCount,
    pendingRewards,
    nodeRewards,
    isClaiming,
    setClaiming,
    debt,
    gas,
    overall,
  } = sweeper;

  let voterRewards = sweeper.megapoolDetails?.data?.voterRewards
    ? ethers.BigNumber.from(sweeper.megapoolDetails.data.voterRewards)
    : ethers.constants.Zero;
  let rethRewards = sweeper.megapoolDetails?.data?.rethRewards
    ? ethers.BigNumber.from(sweeper.megapoolDetails.data.rethRewards)
    : ethers.constants.Zero;

  return (
    <CardContent>
      <Stack direction="column" spacing={2}>
        {/* Distribute section */}
        <Grid container rowSpacing={1} columnSpacing={2} alignItems="center">
          <Grid item xs={5} sx={{ textAlign: "right" }}>
            <Tooltip
              arrow
              sx={{ cursor: "help" }}
              title="Distribute all accumulated rewards (EL + CL) from your megapool. Splits between node operator, voters, protocol DAO, and rETH holders."
            >
              <Stack
                direction={"row"}
                spacing={1}
                justifyContent="end"
                alignItems={"center"}
              >
                <HelpOutline fontSize="inherit" color="disabled" />
                <Typography color={"text.primary"} variant={"subtitle2"}>
                  Distribute
                </Typography>
              </Stack>
            </Tooltip>
          </Grid>
          <Grid item xs={7}>
            <FormControlLabel
              control={
                <Checkbox
                  disabled={!canDistribute}
                  checked={isDistributing}
                  onChange={(e) => setDistributing(e.target.checked)}
                />
              }
              color="text.secondary"
              slotProps={{
                typography: {
                  variant: "caption",
                  color: "text.secondary",
                },
              }}
              disableTypography
              label={
                <Stack spacing={0} direction="column">
                  <CurrencyValue
                    size="xsmall"
                    value={pendingRewards}
                    currency="eth"
                    placeholder="0"
                  />
                  <FormHelperText sx={{ m: 0 }}>
                    {isDistributing ? "Distributing" : "Not Distributing"}
                  </FormHelperText>
                </Stack>
              }
            />
          </Grid>
        </Grid>

        {!canDistribute && (
          <Alert severity="warning" sx={{ mx: 2 }}>
            <AlertTitle>Cannot distribute</AlertTitle>
            {exitingCount} validator{exitingCount !== 1 ? "s" : ""} exiting.
            Wait for exits to finalize before distributing.
          </Alert>
        )}

        {isDistributing && canDistribute && (
          <Stack sx={{ pl: 6 }} spacing={0.5}>
            <Stack direction="row" spacing={2}>
              <Stack direction="column" spacing={0}>
                <CurrencyValue
                  size="xsmall"
                  value={nodeRewards}
                  currency="eth"
                  placeholder="0"
                />
                <FormHelperText sx={{ m: 0 }}>Node share</FormHelperText>
              </Stack>
              <Stack direction="column" spacing={0}>
                <CurrencyValue
                  size="xsmall"
                  value={voterRewards}
                  currency="eth"
                  placeholder="0"
                />
                <FormHelperText sx={{ m: 0 }}>Voter share</FormHelperText>
              </Stack>
              <Stack direction="column" spacing={0}>
                <CurrencyValue
                  size="xsmall"
                  value={rethRewards}
                  currency="eth"
                  placeholder="0"
                />
                <FormHelperText sx={{ m: 0 }}>rETH share</FormHelperText>
              </Stack>
            </Stack>
          </Stack>
        )}

        {/* Claim section */}
        <Grid container rowSpacing={1} columnSpacing={2} alignItems="center">
          <Grid item xs={5} sx={{ textAlign: "right" }}>
            <Tooltip
              arrow
              sx={{ cursor: "help" }}
              title="Transfer unclaimed node operator funds to the withdrawal address. If there's debt, it's repaid first."
            >
              <Stack
                direction={"row"}
                spacing={1}
                justifyContent="end"
                alignItems={"center"}
              >
                <HelpOutline fontSize="inherit" color="disabled" />
                <Typography color={"text.primary"} variant={"subtitle2"}>
                  Claim
                </Typography>
              </Stack>
            </Tooltip>
          </Grid>
          <Grid item xs={7}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isClaiming}
                  onChange={(e) => setClaiming(e.target.checked)}
                />
              }
              color="text.secondary"
              slotProps={{
                typography: {
                  variant: "caption",
                  color: "text.secondary",
                },
              }}
              disableTypography
              label={
                <Stack spacing={0} direction="column">
                  <Typography variant="caption" color="text.secondary">
                    {isClaiming ? "Claiming" : "Not Claiming"}
                  </Typography>
                </Stack>
              }
            />
          </Grid>
        </Grid>

        {!debt.isZero() && (
          <Alert severity="info" sx={{ mx: 2 }}>
            Debt of{" "}
            <CurrencyValue
              size="xsmall"
              value={debt}
              currency="eth"
              placeholder="0"
            />{" "}
            will be repaid from rewards before transfer.
          </Alert>
        )}

        {/* Summary footer */}
        <ReceiptsInfo amountEth={overall.eth} amountGas={overall.gas} />
      </Stack>
    </CardContent>
  );
}

export default function MegapoolSweepCard({
  sx,
  nodeAddress,
  megapoolAddress,
  megapoolDetails,
  sweeper,
}) {
  let { address, connector } = useAccount();
  let withdrawalAddress = useNodeWithdrawalAddress(nodeAddress);
  const isSafeConnected = connector?.id === "safe";
  const isNodeOrWithdrawalAddress =
    address === nodeAddress || address === withdrawalAddress;
  let canWithdraw = isSafeConnected && isNodeOrWithdrawalAddress;
  let color = canWithdraw ? "primary" : "gray";

  let { execute, isDistributing, isClaiming, canDistribute, overall } =
    sweeper;
  let hasOperations =
    (isDistributing && canDistribute) || isClaiming;

  // Pass megapoolDetails through to content for reward breakdown
  let enrichedSweeper = { ...sweeper, megapoolDetails };

  return (
    <Stack sx={sx} direction="column" spacing={2}>
      <Stack
        direction="row"
        alignItems="center"
        sx={{ maxWidth: 700 }}
        justifyContent="flex-start"
      >
        <Tooltip
          arrow
          title={
            <Stack spacing={1} sx={{ m: 1 }}>
              <ReceiptsInfo
                amountEth={overall.eth}
                amountGas={overall.gas}
              />
              <Stack>
                <Grid container columnSpacing={1} rowSpacing={0.5}>
                  {isDistributing && (
                    <>
                      <Grid item xs={4.5}>
                        <Stack direction="row" justifyContent="flex-end">
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            distribute
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={7.5}>
                        <CurrencyValue
                          size="xsmall"
                          value={sweeper.nodeRewards}
                          currency="eth"
                          placeholder="0"
                        />
                      </Grid>
                    </>
                  )}
                  {isClaiming && (
                    <>
                      <Grid item xs={4.5}>
                        <Stack direction="row" justifyContent="flex-end">
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            claim
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={7.5}>
                        <Typography variant="caption" color="text.secondary">
                          transfer to withdrawal address
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Stack>
            </Stack>
          }
        >
          <Stack
            sx={{
              cursor: canWithdraw ? undefined : "not-allowed",
            }}
            direction="row"
            alignItems="center"
          >
            <Button
              onClick={() =>
                execute()
                  .then((res) => console.log("megapool sweep res", res))
                  .catch((err) => console.log("megapool sweep err", err))
              }
              sx={(theme) => ({
                mr: 1.5,
                boxShadow: `0 0 5px ${theme.palette[color].light}`,
              })}
              size="medium"
              variant="outlined"
              color={color}
              disabled={!canWithdraw || !hasOperations}
              endIcon={
                <CurrencyValue
                  value={overall.eth}
                  size="xsmall"
                  currency="eth"
                  placeholder="0"
                />
              }
            >
              Megapool Sweep
            </Button>
          </Stack>
        </Tooltip>
      </Stack>
      <MegapoolSafeAlert sx={{ maxWidth: 700 }} nodeAddress={nodeAddress} />
      <Card sx={{ maxWidth: 700 }}>
        <SweepCardContent sweeper={enrichedSweeper} />
      </Card>
    </Stack>
  );
}
