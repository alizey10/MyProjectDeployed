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

  const rows = data.options?.rows || [];
  const columns = data.options?.columns || [];
  const options = data.options || [];
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
      type === QuestionType.MULTIPLE_CHOICE_GRID ||
      type === QuestionType.CHECKBOX_GRID
        ? { rows: ["", ""], columns: ["", ""] }
        : type === QuestionType.DROPDOWN
        ? [""]
        : []
  });
};

  const handleOptionChange = (index, value) => {
    if (!isEditable) return;
    const updated = [...options];
    updated[index] = value;
    onChange({ ...data, options: updated });
  };

  const addOption = () => {
    if (!isEditable) return;
    onChange({ ...data, options: [...options, ""] });
  };

  const removeOption = (index) => {
    if (!isEditable) return;
    const updated = [...options];
    updated.splice(index, 1);
    onChange({ ...data, options: updated });
  };

  const sendToBackend = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await formService.submitForm({
        [data.key || `q_${data.id}`]: data.response || data.value || ""
      });
    } catch (err) {
      console.error(err);
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
                  <TextField
                    variant="standard"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                  />
                  <IconButton onClick={() => removeOption(i)}>
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
            <TextField select fullWidth>
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
            <Box display="flex" gap={2}>
              <Button
                startIcon={<AddIcon />}
                onClick={() =>
                  onChange({
                    ...data,
                    options: { rows: [...rows, ""], columns }
                  })
                }
              >
                Add Row
              </Button>

              <Button
                startIcon={<AddIcon />}
                onClick={() =>
                  onChange({
                    ...data,
                    options: { rows, columns: [...columns, ""] }
                  })
                }
              >
                Add Column
              </Button>
            </Box>
          )}

          <Box mt={2} border="1px solid #e0e0e0" p={1}>
            <Box display="flex" >
              <Box sx={{ width: 120 }} />
              {columns.map((c, i) => (
                <TextField
                  key={i}
                  variant="standard"
                  value={c}
                  onChange={(e) => {
                    const cols = [...columns];
                    cols[i] = e.target.value;
                    onChange({ ...data, options: { rows, columns: cols } });
                  }}
                   sx={{ width: 120, mx: 1 }}
                />
              ))}
            </Box>

            {rows.map((r, rIdx) => (
              <Box key={rIdx} display="flex" alignItems="center">
                <TextField
                  variant="standard"
                  value={r}
                  onChange={(e) => {
                    const rs = [...rows];
                    rs[rIdx] = e.target.value;
                    onChange({ ...data, options: { rows: rs, columns } });
                  }}
                    sx={{ width: 120, mx: 4 }}
                />

                {columns.map((_, cIdx) =>
                  data.type === QuestionType.MULTIPLE_CHOICE_GRID ? (
                    <Radio key={cIdx} disabled />
                  ) : (
                    <Checkbox key={cIdx} disabled />
                  )
                )}
              </Box>
            ))}
          </Box>        
        </Box>
      )}

      {responseMode && (
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button variant="contained" onClick={sendToBackend} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Response"}
          </Button>

        </Box>
      )}
    </Box>
  );
}
