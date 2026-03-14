import { DataGrid } from "@mui/x-data-grid";
import {
  Chip,
  FormHelperText,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { HourglassEmpty, OpenInNew } from "@mui/icons-material";
import { ethers } from "ethers";
import moment from "moment";
import CurrencyValue from "./CurrencyValue";
import DataToolbar from "./DataToolbar";

function truncatePubkey(pubkey) {
  if (!pubkey) return "";
  return `${pubkey.slice(0, 8)}…${pubkey.slice(-4)}`;
}

const QUEUE_VALIDATOR_COLS = [
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
    valueGetter: ({ row }) => {
      if (row.inPrestake) return "Prestaked";
      if (row.inQueue) return "In Queue";
      return "Unknown";
    },
    renderCell: ({ value }) => (
      <Chip size="small" label={value} variant="outlined" />
    ),
  },
  {
    field: "expressUsed",
    headerName: "Queue Type",
    width: 110,
    renderCell: ({ value }) => (
      <Chip
        size="small"
        label={value ? "Express" : "Standard"}
        variant="outlined"
        color={value ? "primary" : "default"}
      />
    ),
  },
  {
    field: "enqueueTimestamp",
    headerName: "Queued Since",
    width: 140,
    renderCell: ({ value }) => {
      if (!value || value === 0)
        return <Typography variant="caption">—</Typography>;
      return (
        <Typography variant="caption">
          {moment.unix(value).fromNow()}
        </Typography>
      );
    },
    sortComparator: (a, b) => Number(a) - Number(b),
  },
];

function QueueHeader() {
  return (
    <Stack direction="row" alignItems="center">
      <HourglassEmpty sx={{ m: 1, mr: 2 }} fontSize="medium" color="disabled" />
      <Typography variant="subtitle2">Queue & Deposit Pool</Typography>
    </Stack>
  );
}

function DepositPoolSummary({ depositPoolStatus }) {
  return (
    <Stack direction="row" spacing={3} sx={{ pl: 6 }} flexWrap="wrap">
      <Stack direction="column" spacing={0}>
        <CurrencyValue
          size="small"
          currency="eth"
          value={depositPoolStatus.balance || ethers.constants.Zero}
        />
        <FormHelperText sx={{ m: 0 }}>Pool Balance</FormHelperText>
      </Stack>
      <Stack direction="column" spacing={0}>
        {depositPoolStatus.userBalance &&
        depositPoolStatus.userBalance.isNegative() ? (
          <Tooltip
            title="More ETH has been lent by node operators than deposited by rETH stakers"
            arrow
          >
            <div>
              <CurrencyValue
                size="small"
                currency="eth"
                value={depositPoolStatus.userBalance}
                valueColor={(theme) => theme.palette.error.main}
              />
            </div>
          </Tooltip>
        ) : (
          <CurrencyValue
            size="small"
            currency="eth"
            value={depositPoolStatus.userBalance || ethers.constants.Zero}
          />
        )}
        <FormHelperText sx={{ m: 0 }}>Available for Matching</FormHelperText>
      </Stack>
    </Stack>
  );
}

function QueueSummaryLine({
  estimatedQueueCount,
  queuedValidatorCount,
  depositPoolBalance,
}) {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="baseline"
      sx={{ pl: 6 }}
      flexWrap="wrap"
    >
      <Tooltip
        title="Estimated from deposit pool balance. Actual count may differ slightly."
        arrow
      >
        <Typography variant="body2" color="text.secondary">
          ~{estimatedQueueCount != null ? estimatedQueueCount : "—"} validators
          in queue network-wide
        </Typography>
      </Tooltip>
      <Typography variant="body2" color="text.secondary">
        ·
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Your node: {queuedValidatorCount} queued
      </Typography>
      <Typography variant="body2" color="text.secondary">
        ·
      </Typography>
      <Stack direction="row" spacing={0.5} alignItems="baseline">
        <Typography variant="body2" color="text.secondary">
          Deposit pool:
        </Typography>
        <CurrencyValue
          size="xsmall"
          currency="eth"
          value={depositPoolBalance || ethers.constants.Zero}
        />
        <Typography variant="body2" color="text.secondary">
          available
        </Typography>
      </Stack>
    </Stack>
  );
}

export default function QueueStatusCard({
  depositPoolStatus,
  queuedValidators,
  sx,
}) {
  let columns = QUEUE_VALIDATOR_COLS;
  let maxWidth = columns.reduce((sum, { width }) => sum + width, 0);

  // Estimate total validators in queue from nodeBalance / 4 ETH
  let estimatedQueueCount = null;
  if (depositPoolStatus.nodeBalance) {
    let fourEth = ethers.utils.parseEther("4");
    estimatedQueueCount = depositPoolStatus.nodeBalance.div(fourEth).toNumber();
  }

  let header = (
    <Stack spacing={2}>
      <QueueHeader />
      <DepositPoolSummary depositPoolStatus={depositPoolStatus} />
      <QueueSummaryLine
        estimatedQueueCount={estimatedQueueCount}
        queuedValidatorCount={queuedValidators.length}
        depositPoolBalance={depositPoolStatus.balance}
      />
    </Stack>
  );

  return (
    <div style={{ display: "flex", maxWidth, ...sx }}>
      <div style={{ flexGrow: 1, width: "100%" }}>
        <DataGrid
          sx={{ border: 0 }}
          slots={{ toolbar: DataToolbar }}
          slotProps={{
            toolbar: {
              header,
              fileName: `rocketsweep-queue-validators`,
              isLoading: depositPoolStatus.isLoading,
            },
          }}
          density="compact"
          rowSelection={false}
          autoHeight
          pagination
          pageSizeOptions={[5, 10, 20]}
          rows={queuedValidators}
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
