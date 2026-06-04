import { Autocomplete, Chip, Grid, TextField } from "@mui/material";

export default function WorkoutCategoryField({
  categories,
  onChange,
  trainingCategory,
}) {
  return (
    <Grid size={12} container sx={{ marginBottom: "20px" }}>
      <Grid size={12} container sx={{ alignContent: "center" }}>
        <Autocomplete
          disableCloseOnSelect
          value={trainingCategory}
          fullWidth
          multiple
          id="tags-filled"
          defaultValue={trainingCategory.map((category) => category)}
          options={categories.map((option) => option)}
          freeSolo
          onChange={(event, nextValue) => onChange(nextValue)}
          renderValue={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip key={`${option}-${index}`} variant="outlined" label={option} {...tagProps} />
              );
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Muscle Groups"
            />
          )}
        />
      </Grid>
    </Grid>
  );
}
