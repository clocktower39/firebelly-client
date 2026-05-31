import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";

export default function ScheduleTableFilterMenu({
  anchorEl,
  onClose,
  tableFilterLabel,
  tableSortKey,
  tableFilterKey,
  tableSortDirection,
  applyTableSort,
  toggleColumnVisibility,
  isColumnHidden,
  hiddenTableColumns,
  showAllColumns,
  tableColumnLabels,
  tableFilterTypes,
  setTableFilterTypes,
  weekTypeOptions,
  tableFilterDates,
  setTableFilterDates,
  weekDays,
  tableFilterTimes,
  setTableFilterTimes,
  weekTimeOptions,
  tableFilterStatuses,
  setTableFilterStatuses,
  weekStatusOptions,
  tableFilterClientQuery,
  setTableFilterClientQuery,
  weekTableClientOptions,
  tableFilterClients,
  setTableFilterClients,
  tableFilterPrices,
  setTableFilterPrices,
  weekPriceOptions,
}) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      PaperProps={{ sx: { minWidth: 220, p: 1 } }}
    >
      <Stack spacing={1}>
        <Typography variant="subtitle1">{tableFilterLabel || "Column options"}</Typography>
        <Stack spacing={0.75}>
          <Typography variant="caption" color="text.secondary">
            Sort
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant={
                tableSortKey === tableFilterKey && tableSortDirection === "asc"
                  ? "contained"
                  : "outlined"
              }
              startIcon={<ArrowUpward fontSize="small" />}
              onClick={() => {
                applyTableSort(tableFilterKey, "asc");
                onClose();
              }}
            >
              Asc
            </Button>
            <Button
              size="small"
              variant={
                tableSortKey === tableFilterKey && tableSortDirection === "desc"
                  ? "contained"
                  : "outlined"
              }
              startIcon={<ArrowDownward fontSize="small" />}
              onClick={() => {
                applyTableSort(tableFilterKey, "desc");
                onClose();
              }}
            >
              Desc
            </Button>
          </Stack>
        </Stack>
        <Divider />
        <Stack spacing={0.75}>
          <Typography variant="caption" color="text.secondary">
            Column visibility
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              toggleColumnVisibility(tableFilterKey);
              onClose();
            }}
          >
            {isColumnHidden(tableFilterKey) ? "Show column" : "Hide column"}
          </Button>
          {hiddenTableColumns.length > 0 && (
            <Stack spacing={1}>
              <Button size="small" onClick={showAllColumns}>
                Show all columns
              </Button>
              <Stack spacing={0.5}>
                {hiddenTableColumns.map((columnKey) => (
                  <Button
                    key={columnKey}
                    size="small"
                    variant="text"
                    onClick={() => toggleColumnVisibility(columnKey)}
                  >
                    Show {tableColumnLabels[columnKey] || columnKey}
                  </Button>
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
        <Divider />
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Filter
          </Typography>
          {tableFilterKey === "type" && (
            <>
              <MenuItem dense onClick={() => setTableFilterTypes([])}>
                All
              </MenuItem>
              <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                {weekTypeOptions.map((type) => {
                  const isChecked = tableFilterTypes.includes(type);
                  return (
                    <MenuItem
                      key={type}
                      dense
                      sx={{ py: 0.25 }}
                      onClick={() =>
                        setTableFilterTypes((prev) =>
                          prev.includes(type)
                            ? prev.filter((item) => item !== type)
                            : [...prev, type]
                        )
                      }
                    >
                      <Checkbox size="small" checked={isChecked} />
                      <ListItemText primary={type} primaryTypographyProps={{ variant: "body2" }} />
                    </MenuItem>
                  );
                })}
              </Box>
              {tableFilterTypes.length > 0 && (
                <Button size="small" onClick={() => setTableFilterTypes([])}>
                  Clear filter
                </Button>
              )}
            </>
          )}
          {tableFilterKey === "date" && (
            <>
              <MenuItem dense onClick={() => setTableFilterDates([])}>
                All
              </MenuItem>
              <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                {weekDays.map((day) => {
                  const value = day.format("YYYY-MM-DD");
                  const isChecked = tableFilterDates.includes(value);
                  return (
                    <MenuItem
                      dense
                      key={value}
                      sx={{ py: 0.25 }}
                      onClick={() =>
                        setTableFilterDates((prev) =>
                          prev.includes(value)
                            ? prev.filter((item) => item !== value)
                            : [...prev, value]
                        )
                      }
                    >
                      <Checkbox size="small" checked={isChecked} />
                      <ListItemText
                        primary={day.format("ddd, MMM D")}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </MenuItem>
                  );
                })}
              </Box>
              {tableFilterDates.length > 0 && (
                <Button size="small" onClick={() => setTableFilterDates([])}>
                  Clear filter
                </Button>
              )}
            </>
          )}
          {tableFilterKey === "time" && (
            <>
              <MenuItem dense onClick={() => setTableFilterTimes([])}>
                All
              </MenuItem>
              <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                {weekTimeOptions.map((timeLabel) => {
                  const isChecked = tableFilterTimes.includes(timeLabel);
                  return (
                    <MenuItem
                      key={timeLabel}
                      dense
                      sx={{ py: 0.25 }}
                      onClick={() =>
                        setTableFilterTimes((prev) =>
                          prev.includes(timeLabel)
                            ? prev.filter((item) => item !== timeLabel)
                            : [...prev, timeLabel]
                        )
                      }
                    >
                      <Checkbox size="small" checked={isChecked} />
                      <ListItemText
                        primary={timeLabel}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </MenuItem>
                  );
                })}
              </Box>
              {tableFilterTimes.length > 0 && (
                <Button size="small" onClick={() => setTableFilterTimes([])}>
                  Clear filter
                </Button>
              )}
            </>
          )}
          {tableFilterKey === "status" && (
            <>
              <MenuItem dense onClick={() => setTableFilterStatuses([])}>
                All
              </MenuItem>
              <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                {weekStatusOptions.map((status) => {
                  const isChecked = tableFilterStatuses.includes(status);
                  return (
                    <MenuItem
                      key={status}
                      dense
                      sx={{ py: 0.25 }}
                      onClick={() =>
                        setTableFilterStatuses((prev) =>
                          prev.includes(status)
                            ? prev.filter((item) => item !== status)
                            : [...prev, status]
                        )
                      }
                    >
                      <Checkbox size="small" checked={isChecked} />
                      <ListItemText
                        primary={status}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </MenuItem>
                  );
                })}
              </Box>
              {tableFilterStatuses.length > 0 && (
                <Button size="small" onClick={() => setTableFilterStatuses([])}>
                  Clear filter
                </Button>
              )}
            </>
          )}
          {tableFilterKey === "client" && (
            <Stack spacing={0.75}>
              <TextField
                label="Client contains"
                value={tableFilterClientQuery}
                onChange={(event) => setTableFilterClientQuery(event.target.value)}
                size="small"
                fullWidth
              />
              <MenuItem dense onClick={() => setTableFilterClients([])}>
                All
              </MenuItem>
              <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                {weekTableClientOptions
                  .filter((client) =>
                    client.toLowerCase().includes(tableFilterClientQuery.trim().toLowerCase())
                  )
                  .map((client) => {
                    const isChecked = tableFilterClients.includes(client);
                    return (
                      <MenuItem
                        key={client}
                        dense
                        sx={{ py: 0.25 }}
                        onClick={() =>
                          setTableFilterClients((prev) =>
                            prev.includes(client)
                              ? prev.filter((item) => item !== client)
                              : [...prev, client]
                          )
                        }
                      >
                        <Checkbox size="small" checked={isChecked} />
                        <ListItemText
                          primary={client}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </MenuItem>
                    );
                  })}
              </Box>
              {tableFilterClients.length > 0 && (
                <Button size="small" onClick={() => setTableFilterClients([])}>
                  Clear filter
                </Button>
              )}
            </Stack>
          )}
          {tableFilterKey === "price" && (
            <>
              <MenuItem dense onClick={() => setTableFilterPrices([])}>
                All
              </MenuItem>
              <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                {weekPriceOptions.map((priceLabel) => {
                  const isChecked = tableFilterPrices.includes(priceLabel);
                  return (
                    <MenuItem
                      key={priceLabel}
                      dense
                      sx={{ py: 0.25 }}
                      onClick={() =>
                        setTableFilterPrices((prev) =>
                          prev.includes(priceLabel)
                            ? prev.filter((item) => item !== priceLabel)
                            : [...prev, priceLabel]
                        )
                      }
                    >
                      <Checkbox size="small" checked={isChecked} />
                      <ListItemText
                        primary={priceLabel}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </MenuItem>
                  );
                })}
              </Box>
              {tableFilterPrices.length > 0 && (
                <Button size="small" onClick={() => setTableFilterPrices([])}>
                  Clear filter
                </Button>
              )}
            </>
          )}
        </Stack>
      </Stack>
    </Menu>
  );
}

