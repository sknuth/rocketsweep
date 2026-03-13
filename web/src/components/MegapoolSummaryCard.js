import { DataGrid } from "@mui/x-data-grid";
import {
  Chip,
  CircularProgress,
  FormHelperText,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { AllInclusive, OpenInNew } from "@mui/icons-material";
import { ethers } from "ethers";
import CurrencyValue from "./CurrencyValue";
import DataToolbar from "./DataToolbar";

function getMegapoolValidatorStatus(v) {
  if (v.dissolved) return "dissolved";
  if (v.exited) return "exited";
  if (v.exiting) return "exiting";
  if (v.locked) return "locked";
  if (v.staked) return "staking";
  if (v.inPrestake) return "prestaked";
  if (v.inQueue) return "queued";
  return "initialized";
}

function truncatePubkey(pubkey) {
  if (!pubkey) return "";
  return `${pubkey.slice(0, 8)}…${pubkey.slice(-4)}`;
}

const VALIDATOR_COLS = [
  {
    field: "validatorId",
    headerName: "ID",
    width: 60,
  },
  {
    field: "pubkey",
    headerName: "Pubkey",
    width: 165,
    renderCell: ({ value }) => (
      <>
        <Chip
          sx={{ mr: 1 }}
          size="small"
          clickable
          component="a"
          target="_blank"
          href={`https://beaconcha.in/validator/${value}`}
          label={truncatePubkey(value)}
        />
        <IconButton
          size={"small"}
          variant={"contained"}
          color={"default"}
          clickable="true"
          component="a"
          target="_blank"
          href={`https://beaconcha.in/validator/${value}`}
        >
          <OpenInNew fontSize="inherit" />
        </IconButton>
      </>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 110,
    valueGetter: ({ row }) => getMegapoolValidatorStatus(row),
    renderCell: ({ value }) => (
      <Chip size="small" label={value} variant="outlined" />
    ),
  },
  {
    field: "lastRequestedBond",
    headerName: "Bond",
    width: 100,
    renderCell: ({ value }) => {
      // lastRequestedBond is a uint32 stored in milliETH (1 unit = 0.001 ETH = 1e15 wei)
      let bondWei = ethers.utils.parseUnits(String(value || 0), 15);
      return <CurrencyValue size="small" currency="eth" value={bondWei} />;
    },
  },
  {
    field: "expressUsed",
    headerName: "Express",
    width: 100,
    renderCell: ({ value }) => (
      <Chip
        size="small"
        label={value ? "Express" : "Standard"}
        variant="outlined"
        color={value ? "primary" : "default"}
      />
    ),
  },
];

function MegapoolHeader() {
  return (
    <Stack direction="row" alignItems="center">
      <AllInclusive sx={{ m: 1, mr: 2 }} fontSize="medium" color="disabled" />
      <Typography variant="subtitle2">Megapool</Typography>
    </Stack>
  );
}

export default function MegapoolSummaryCard({ megapoolDetails, sx }) {
  let { data, isLoading, validatorsLoading, validatorsLoadedCount, validatorsTotalCount } =
    megapoolDetails;
  let columns = VALIDATOR_COLS;
  let maxWidth = columns.reduce((sum, { width }) => sum + width, 0);
  let validators = data?.validators || [];

  let header = (
    <Stack spacing={2}>
      <MegapoolHeader />
      {data && (
        <Stack direction="row" spacing={3} sx={{ pl: 6 }} flexWrap="wrap">
          <Stack direction="column" spacing={0}>
            <Typography variant="body2">
              {data.activeValidatorCount} active / {data.validatorCount} total
            </Typography>
            <FormHelperText sx={{ m: 0 }}>Validators</FormHelperText>
          </Stack>
          <Stack direction="column" spacing={0}>
            <CurrencyValue
              size="small"
              currency="eth"
              value={ethers.BigNumber.from(data.nodeBond || "0")}
            />
            <FormHelperText sx={{ m: 0 }}>Bond</FormHelperText>
          </Stack>
          <Stack direction="column" spacing={0}>
            <CurrencyValue
              size="small"
              currency="eth"
              value={ethers.BigNumber.from(data.pendingRewards || "0")}
            />
            <FormHelperText sx={{ m: 0 }}>Pending Rewards</FormHelperText>
          </Stack>
          {!ethers.BigNumber.from(data.debt || "0").isZero() && (
            <Stack direction="column" spacing={0}>
              <CurrencyValue
                size="small"
                currency="eth"
                value={ethers.BigNumber.from(data.debt || "0")}
              />
              <FormHelperText sx={{ m: 0 }}>Debt</FormHelperText>
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );

  if (isLoading) {
    return (
      <Stack
        sx={{ ...sx, py: 3 }}
        direction="column"
        alignItems="center"
        spacing={2}
      >
        <MegapoolHeader />
        <CircularProgress size={24} />
      </Stack>
    );
  }

  return (
    <div style={{ display: "flex", maxWidth, ...sx }}>
      <div style={{ flexGrow: 1, width: "100%" }}>
        <DataGrid
          sx={{ border: 0 }}
          slots={{ toolbar: DataToolbar }}
          slotProps={{
            toolbar: {
              header,
              fileName: `rocketsweep-megapool-${data?.megapoolAddress || "unknown"}`,
              isLoading: validatorsLoading,
            },
          }}
          density="compact"
          rowSelection={false}
          autoHeight
          pagination
          pageSizeOptions={[5, 10, 20, 50, 100]}
          rows={validators}
          getRowId={({ validatorId }) => validatorId}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
            sorting: {
              sortModel: [
                {
                  field: "validatorId",
                  sort: "asc",
                },
              ],
            },
          }}
          disableSelectionOnClick
        />
      </div>
    </div>
  );
}
