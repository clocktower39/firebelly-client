import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { scheduleColors, statusColors } from "../constants";
import { formatRange } from "../utils/scheduleUtils";

function SortButton({ sortKey, tableSortKey, tableSortDirection, onSort }) {
  return (
    <IconButton size="small" onClick={() => onSort(sortKey)}>
      {tableSortKey === sortKey && tableSortDirection === "desc" ? (
        <ArrowDownward fontSize="inherit" />
      ) : (
        <ArrowUpward fontSize="inherit" />
      )}
    </IconButton>
  );
}

function HeaderCell({
  label,
  filterKey,
  tableSortKey,
  tableSortDirection,
  openTableFilter,
  toggleTableSort,
}) {
  return (
    <TableCell>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Button
          size="small"
          variant="text"
          onClick={(event) => openTableFilter(event, filterKey, label)}
        >
          {label}
        </Button>
        <SortButton
          sortKey={filterKey}
          tableSortKey={tableSortKey}
          tableSortDirection={tableSortDirection}
          onSort={toggleTableSort}
        />
      </Stack>
    </TableCell>
  );
}

export default function SessionEventsTable({
  sortedWeekRows,
  tableColumnCount,
  isTableFilterActive,
  isColumnHidden,
  openTableFilter,
  toggleTableSort,
  tableSortKey,
  tableSortDirection,
  isTrainerView,
  isClientView,
  isShareMode,
  shareHidePrices,
  getEventDisplayName,
  getRowPayoutLabel,
  selectedTrainerId,
  selectedTrainerLabel,
  openActionForEvent,
  openRequestForEvent,
}) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Typography variant="h6">Session Events (Week)</Typography>
          <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  {!isColumnHidden("date") && (
                    <HeaderCell
                      label="Date"
                      filterKey="date"
                      tableSortKey={tableSortKey}
                      tableSortDirection={tableSortDirection}
                      openTableFilter={openTableFilter}
                      toggleTableSort={toggleTableSort}
                    />
                  )}
                  {!isColumnHidden("time") && (
                    <HeaderCell
                      label="Time"
                      filterKey="time"
                      tableSortKey={tableSortKey}
                      tableSortDirection={tableSortDirection}
                      openTableFilter={openTableFilter}
                      toggleTableSort={toggleTableSort}
                    />
                  )}
                  {!isColumnHidden("type") && (
                    <HeaderCell
                      label="Type"
                      filterKey="type"
                      tableSortKey={tableSortKey}
                      tableSortDirection={tableSortDirection}
                      openTableFilter={openTableFilter}
                      toggleTableSort={toggleTableSort}
                    />
                  )}
                  {!isColumnHidden("status") && (
                    <HeaderCell
                      label="Status"
                      filterKey="status"
                      tableSortKey={tableSortKey}
                      tableSortDirection={tableSortDirection}
                      openTableFilter={openTableFilter}
                      toggleTableSort={toggleTableSort}
                    />
                  )}
                  {!isColumnHidden("client") && (
                    <HeaderCell
                      label="Client"
                      filterKey="client"
                      tableSortKey={tableSortKey}
                      tableSortDirection={tableSortDirection}
                      openTableFilter={openTableFilter}
                      toggleTableSort={toggleTableSort}
                    />
                  )}
                  {isTrainerView &&
                    !(isShareMode && shareHidePrices) &&
                    !isColumnHidden("price") && (
                      <HeaderCell
                        label="Price"
                        filterKey="price"
                        tableSortKey={tableSortKey}
                        tableSortDirection={tableSortDirection}
                        openTableFilter={openTableFilter}
                        toggleTableSort={toggleTableSort}
                      />
                    )}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedWeekRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={tableColumnCount}>
                      <Typography color="text.secondary">
                        {isTableFilterActive
                          ? "No session events match the current filters."
                          : "No session events."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {sortedWeekRows.map((event) => (
                  <TableRow key={event._id}>
                    {!isColumnHidden("date") && (
                      <TableCell>{dayjs(event.startDateTime).format("ddd, MMM D")}</TableCell>
                    )}
                    {!isColumnHidden("time") && <TableCell>{formatRange(event)}</TableCell>}
                    {!isColumnHidden("type") && (
                      <TableCell>
                        <Chip
                          label={event.eventType}
                          color={scheduleColors[event.eventType] || "default"}
                          size="small"
                        />
                      </TableCell>
                    )}
                    {!isColumnHidden("status") && (
                      <TableCell>
                        <Chip
                          label={event.status}
                          color={statusColors[event.status] || "default"}
                          size="small"
                        />
                      </TableCell>
                    )}
                    {!isColumnHidden("client") && (
                      <TableCell>
                        {isTrainerView && (event.clientId || event.customClientName)
                          ? getEventDisplayName(event)
                          : isClientView && selectedTrainerId
                          ? selectedTrainerLabel || "Trainer"
                          : event.eventType === "AVAILABILITY"
                          ? "Open slot"
                          : "-"}
                      </TableCell>
                    )}
                    {isTrainerView &&
                      !(isShareMode && shareHidePrices) &&
                      !isColumnHidden("price") && (
                        <TableCell>{getRowPayoutLabel(event)}</TableCell>
                      )}
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                        {event.workoutId && (
                          <Button
                            size="small"
                            variant="outlined"
                            component={Link}
                            to={`/workout/${event.workoutId}?event=${event._id}`}
                          >
                            Open Workout
                          </Button>
                        )}
                        {isTrainerView && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openActionForEvent(event)}
                          >
                            Details
                          </Button>
                        )}
                        {isClientView &&
                          event.eventType === "AVAILABILITY" &&
                          event.status === "OPEN" && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => openRequestForEvent(event)}
                            >
                              Request
                            </Button>
                          )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
