import {
  Box,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Radio,
  Checkbox,
  Button
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { QuestionType } from "@/enum/types-enum";
import formService from "@/@services/formService";
import { useState } from "react";
export default function QuestionCard({ data, onDelete, onChange, responseMode = false }) {
  const isEditable = !responseMode;

  const rowLabels = data.rowLabels || [];
  const columnLabels = data.columnLabels || [];
  const options = data.options || { rows: [], columns: [] };
const [submitting, setSubmitting] = useState(false);
  const handleLabelChange = (e) => {
    if (!isEditable) return;
    onChange({ ...data, label: e.target.value });
  };

  const handleTypeChange = (e) => {
    if (!isEditable) return;
    const type = e.target.value;

    onChange({
      ...data,
      type,

      options:
        type.includes("grid")
          ? { rows: ["", "", ""], columns: ["", "", ""] }
          : type === QuestionType.DROPDOWN
          ? [""]
          : [],

      rowLabels: type.includes("grid") ? ["", "", ""] : [],
      columnLabels: type.includes("grid") ? ["", "", ""] : [],
    });
  };

  const handleOptionChange = (index, value) => {
    if (!isEditable) return;
    const updated = [...(data.options || [])];
    updated[index] = value;
    onChange({ ...data, options: updated });
  };

  const addOption = () => {
    if (!isEditable) return;
    onChange({ ...data, options: [...(data.options || []), ""] });
  };

  const removeOption = (index) => {
    if (!isEditable) return;
    const updated = [...(data.options || [])];
    updated.splice(index, 1);
    onChange({ ...data, options: updated });
  };

 const sendToBackend = async () => {
  if (submitting) return; 
  setSubmitting(true);

  try {
    const payload = {
      [data.key || `q_${data.id}`]: data.response || data.value || ""
    };
    await formService.submitForm(payload);
   
  } catch (error) {
    console.error("Failed to submit response:", error);
  
  } finally {
    setSubmitting(false);
  }
};

  return (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 2,
        mb: 2,
        bgcolor: "#fafafa",
      }}
    >
     
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <TextField
          label="Question"
          value={data.label}
          onChange={handleLabelChange}
          fullWidth
          variant="standard"
          disabled={!isEditable}
        />
        {isEditable && (
          <>
            <TextField
              select
              value={data.type}
              onChange={handleTypeChange}
              size="small"
              sx={{ ml: 2, width: 180 }}
            >
              <MenuItem value={QuestionType.TEXT}>Short Answer</MenuItem>
              <MenuItem value={QuestionType.PARAGRAPH}>Paragraph</MenuItem>
              <MenuItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</MenuItem>
              <MenuItem value={QuestionType.CHECKBOX}>Checkboxes</MenuItem>
              <MenuItem value={QuestionType.DROPDOWN}>Dropdown</MenuItem>
              <MenuItem value={QuestionType.MULTIPLE_CHOICE_GRID}>Multiple Choice Grid</MenuItem>
              <MenuItem value={QuestionType.CHECKBOX_GRID}>Checkbox Grid</MenuItem>
              <MenuItem value={QuestionType.DATE}>Date</MenuItem>
              <MenuItem value={QuestionType.TIME}>Time</MenuItem>
            </TextField>
            <IconButton onClick={onDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </Box>

      {data.type === QuestionType.TEXT && (
        <TextField
          placeholder="Short answer text"
          fullWidth
          variant="standard"
          sx={{ mt: 2 }}
          value={data.response || ""}
          onChange={(e) => onChange({ ...data, response: e.target.value })}
          disabled={isEditable}
        />
      )}

      {data.type === QuestionType.PARAGRAPH && (
        <TextField
          placeholder="Long answer text"
          fullWidth
          multiline
          rows={3}
          variant="standard"
          sx={{ mt: 2 }}
          value={data.response || ""}
          onChange={(e) => onChange({ ...data, response: e.target.value })}
          disabled={isEditable}
        />
      )}

      {data.type === QuestionType.DROPDOWN && (
        <Box sx={{ mt: 2 }}>
          {isEditable ? (
            <>
              {options.map((opt, i) => (
                <Box key={i} display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography>{i + 1}.</Typography>
                  <TextField
                    placeholder={`Option ${i + 1}`}
                    value={opt || ""}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    variant="standard"
                    sx={{ width: 200 }}
                  />
                  <IconButton color="error" onClick={() => removeOption(i)}>
                    <RemoveIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                onClick={addOption}
                startIcon={<AddIcon />}
                variant="text"
                sx={{
                  textTransform: "none",
                  color: "primary.main",
                  fontSize: "0.875rem",
                  "&:hover": { backgroundColor: "transparent" },
                }}
              >
                Add option
              </Button>
            </>
          ) : (
            <TextField
              select
              fullWidth
              value={data.response || ""}
              onChange={(e) => onChange({ ...data, response: e.target.value })}
            >
              {options.map((opt, i) => (
                <MenuItem key={i} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Box>
      )}

      {data.type === QuestionType.MULTIPLE_CHOICE && (
        <Box sx={{ mt: 2 }}>
          {options.map((opt, i) => (
            <Box key={i} display="flex" alignItems="center" gap={1}>
              <Radio
                checked={data.response === opt}
                onChange={() => onChange({ ...data, response: opt })}
                disabled={isEditable}
              />
              <TextField
                variant="standard"
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                disabled={!isEditable}
              />
            </Box>
          ))}
          {isEditable && <IconButton onClick={addOption} sx={{ mt: 1 }}><AddIcon /></IconButton>}
        </Box>
      )}

      {data.type === QuestionType.CHECKBOX && (
        <Box sx={{ mt: 2 }}>
          {options.map((opt, i) => (
            <Box key={i} display="flex" alignItems="center" gap={1}>
              <Checkbox
                checked={data.response?.includes(opt) || false}
                onChange={() => {
                  const current = data.response || [];
                  const updated = current.includes(opt)
                    ? current.filter((x) => x !== opt)
                    : [...current, opt];
                  onChange({ ...data, response: updated });
                }}
                disabled={isEditable}
              />
              <TextField
                variant="standard"
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                disabled={!isEditable}
              />
            </Box>
          ))}
          {isEditable && <IconButton onClick={addOption} sx={{ mt: 1 }}><AddIcon /></IconButton>}
        </Box>
      )}


{(data.type === QuestionType.MULTIPLE_CHOICE_GRID ||
  data.type === QuestionType.CHECKBOX_GRID) && (
  <Box sx={{ mt: 2 }}>

    {isEditable && (
      <>

        <Box display="flex" gap={2} mb={1}>
          <Button
            onClick={() =>
              onChange({
                ...data,
                rowLabels: [...rowLabels, ""],
                options: {
                  rows: [...rowLabels, ""],
                  columns: columnLabels
                }
              })
            }
            startIcon={<AddIcon />}
          >
            Add Row
          </Button>

          <Button
            onClick={() =>
              onChange({
                ...data,
                columnLabels: [...columnLabels, ""],
                options: {
                  rows: rowLabels,
                  columns: [...columnLabels, ""]
                }
              })
            }
            startIcon={<AddIcon />}
          >
            Add Column
          </Button>
        </Box>

        <Box mt={2} border="1px solid #e0e0e0" p={1}>
          <Box display="flex">
            <Box sx={{ width: 120 }} />
            {columnLabels.map((col, cIdx) => (
              <TextField
                key={cIdx}
                placeholder={`Col ${cIdx + 1}`}
                value={col}
                onChange={(e) => {
                  const newCols = [...columnLabels];
                  newCols[cIdx] = e.target.value;
                  onChange({
                    ...data,
                    columnLabels: newCols,
                    options: { rows: rowLabels, columns: newCols }
                  });
                }}
                variant="standard"
                sx={{ width: 120, mx: 0.5 }}
              />
            ))}
          </Box>

          {rowLabels.map((row, rIdx) => (
            <Box key={rIdx} display="flex" alignItems="center" mt={1}>
              <TextField
                placeholder={`Row ${rIdx + 1}`}
                value={row}
                onChange={(e) => {
                  const newRows = [...rowLabels];
                  newRows[rIdx] = e.target.value;
                  onChange({
                    ...data,
                    rowLabels: newRows,
                    options: { rows: newRows, columns: columnLabels }
                  });
                }}
                variant="standard"
                sx={{ width: 120, mr: 1 }}
              />

          
              {columnLabels.map((col, cIdx) =>
                data.type === QuestionType.MULTIPLE_CHOICE_GRID ? (
                  <Radio key={cIdx} disabled sx={{ mx: 0.5 }} />
                ) : (
                  <Checkbox key={cIdx} disabled sx={{ mx: 0.5 }} />
                )
              )}
            </Box>
          ))}
        </Box>
      </>
    )}

    {!isEditable && (
      <Box mt={2} border="1px solid #e0e0e0" p={1}>
      
        <Box display="flex">
          <Box sx={{ width: 120, fontWeight: "bold" }} />
          {columnLabels.map((col, cIdx) => (
            <Box key={cIdx} sx={{ width: 120, textAlign: "center", fontWeight: "bold" }}>
              {col}
            </Box>
          ))}
        </Box>

       
        {rowLabels.map((row, rIdx) => (
          <Box key={rIdx} display="flex" alignItems="center" mt={1}>
            <Box sx={{ width: 120, fontWeight: "bold" }}>{row}</Box>

            {columnLabels.map((col, cIdx) => {
              const cellKey = `${rIdx}-${cIdx}`;

              return data.type === QuestionType.MULTIPLE_CHOICE_GRID ? (
                <Radio
                  key={cellKey}
                  checked={data.response === cellKey}
                  onChange={() => onChange({ ...data, response: cellKey })}
                />
              ) : (
                <Checkbox
                  key={cellKey}
                  checked={data.response?.includes(cellKey)}
                  onChange={() => {
                    const current = data.response || [];
                    const updated = current.includes(cellKey)
                      ? current.filter((x) => x !== cellKey)
                      : [...current, cellKey];

                    onChange({ ...data, response: updated });
                  }}
                />
              );
            })}
          </Box>
        ))}
      </Box>
    )}

  </Box>
)}


      {data.type === QuestionType.DATE && (
        <TextField
          type="date"
          fullWidth
          variant="standard"
          sx={{ mt: 2 }}
          value={data.value || ""}
          onChange={(e) => onChange({ ...data, value: e.target.value })}
        />
      )}

      {data.type === QuestionType.TIME && (
        <TextField
          type="time"
          fullWidth
          variant="standard"
          sx={{ mt: 2 }}
          value={data.value || ""}
          onChange={(e) => onChange({ ...data, value: e.target.value })}
        />
      )}

      {responseMode && (
        <Box display="flex" justifyContent="flex-end" mt={2}>
         <Button
  variant="contained"
  onClick={sendToBackend}
  disabled={submitting}
>
  {submitting ? "Submitting..." : "Submit Response"}
</Button>

        </Box>
      )}
    </Box>
  );
}
