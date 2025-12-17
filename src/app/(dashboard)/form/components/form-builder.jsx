"use client";
import { QuestionType } from "@/enum/types-enum";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Fab,
  Tooltip,
  Tabs,
  Tab,
  Grid,
  Button,
  CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import QuestionCard from "./question-card";
import formService from "@/@services/formService";
import { toast } from "react-toastify";
import { getStatusCode, HttpStatus, getMessage } from "@/utils/getStatusCode";

export const TabType = {
  QUESTIONS: "questions",
  RESPONSES: "responses",
};

export default function FormBuilder({ onFormCreated, existingFormId }) {
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState(TabType.QUESTIONS);
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const titleRef = useRef(null);
  const descRef = useRef(null);

  useEffect(() => {
    if (!existingFormId) return;

    (async () => {
      try {
        const response = await formService.getFormById(existingFormId);
        const data = response?.data?.data;

        if (!data) {
          toast.error("Form not found");
          return;
        }

        setFormTitle(data.formTitle || "Untitled Form");
        setFormDescription(data.formDescription || "");

        setQuestions(
          data.fields?.map(f => {
            let parsedOptions;

            try {
              if (f.optionsJson) {
                const raw = JSON.parse(f.optionsJson);
                
                if (
                  f.fieldType === QuestionType.MULTIPLE_CHOICE_GRID ||
                  f.fieldType === QuestionType.CHECKBOX_GRID
                ) {
                  parsedOptions = raw?.rows && raw?.columns ? raw : { rows: [], columns: [] };
                } else {
                  parsedOptions = Array.isArray(raw) ? raw : [];
                }
              } else {
                parsedOptions =
                  f.fieldType === QuestionType.MULTIPLE_CHOICE_GRID ||
                  f.fieldType === QuestionType.CHECKBOX_GRID
                    ? { rows: [], columns: [] }
                    : [];
              }
            } catch (e) {
              console.warn("Options parse failed:", f.fieldLabel, e);
              parsedOptions =
                f.fieldType === QuestionType.MULTIPLE_CHOICE_GRID ||
                f.fieldType === QuestionType.CHECKBOX_GRID
                  ? { rows: [], columns: [] }
                  : [];
            }

            return {
              id: f.fieldId,
              label: f.fieldLabel,
              type: f.fieldType,
              options: parsedOptions,
              placeholder: f.placeholder || "",
              isRequired: f.isRequired ?? false,
              validationRules: f.validationRules || "",
            };
          }) || []
        );
      } catch (err) {
        toast.error(getMessage(err));
        console.error("Load form error:", err);
      }
    })();
  }, [existingFormId]);

  const addQuestion = (type = QuestionType.TEXT) => {
    setQuestions(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        label: "Untitled Question",
        type,
        options:
          type === QuestionType.MULTIPLE_CHOICE_GRID ||
          type === QuestionType.CHECKBOX_GRID
            ? { rows: ["Row 1"], columns: ["Column 1"] }
            : [],
        placeholder: "",
        isRequired: false,
        validationRules: "",
      },
    ]);
  };

  const deleteQuestion = id => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const updateQuestion = (id, updated) => {
    setQuestions(prev => prev.map(q => (q.id === id ? updated : q)));
  };

  const saveForm = async () => {
    if (!formTitle.trim()) {
      toast.error("Form title is required");
      return;
    }

    const fields = questions.map((q, index) => {
      let optionsJson;

      if (
        q.type === QuestionType.MULTIPLE_CHOICE_GRID ||
        q.type === QuestionType.CHECKBOX_GRID
      ) {
        optionsJson = JSON.stringify({
          rows: Array.isArray(q.options?.rows) ? q.options.rows : [],
          columns: Array.isArray(q.options?.columns) ? q.options.columns : [],
        });
      } else {
        optionsJson = JSON.stringify(Array.isArray(q.options) ? q.options : []);
      }

      return {
        fieldLabel: q.label || "Untitled Question",
        fieldType: q.type.toLowerCase(),
        placeholder: q.placeholder || "",
        isRequired: !!q.isRequired,
        displayOrder: index + 1,
        optionsJson,
        validationRules: q.validationRules || "",
      };
    });

    const payload = {
      formTitle: formTitle.trim(),
      formDescription: formDescription || "",
      fields,
    };

    try {
      setLoading(true);

      const response = existingFormId
        ? await formService.updateForm(existingFormId, payload)
        : await formService.createForm(payload);

      const code = getStatusCode(response);
      const message = getMessage(response);

      if (code !== HttpStatus.OK && code !== HttpStatus.Created) {
        toast.error(message || "Failed to save form");
        return;
      }

      toast.success(message || "Form saved successfully");

      if (onFormCreated) onFormCreated(response?.data?.data);
    } catch (err) {
      toast.error(getMessage(err));
      console.error("Save form error:", err);
    } finally {
      setLoading(false);
    }
  };

  const isAnyFieldEmpty = () => {
    return questions.length === 0 || !formTitle.trim();
  };

  const handleCancel = () => {

    setQuestions([]);
    setFormTitle("Untitled Form");
    setFormDescription("");

    if (typeof onFormCreated === "function") {
      onFormCreated(null);
    }
  };

  return (
    <>
  <Grid container spacing={2} sx={{ mb: 2, alignItems: "center" }}>
  <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-start" }}>
    <Typography
      sx={{
        fontWeight: 500,   
        fontSize: "18px", 
        lineHeight: 1.5,
          color: "black", 
      }}
    >
      Add List
    </Typography>
  </Grid>
</Grid>



      <Typography
        variant="h5"
        contentEditable
        suppressContentEditableWarning
        ref={titleRef}
        onBlur={() => setFormTitle(titleRef.current.textContent)}
        sx={{ fontWeight: 600, mb: 1 }}
        mt={5}
      >
        {formTitle}
      </Typography>

      <Typography
        contentEditable
        suppressContentEditableWarning
        ref={descRef}
        onBlur={() => setFormDescription(descRef.current.textContent)}
        sx={{
          color: formDescription ? "black" : "#999",
          mb: 3,
          minHeight: 100,
          border: "1px solid #ccc",
          borderRadius: 2,
          p: 1.5,
          outline: "none",
          "&:empty:before": {
            content: '"Form Description"',
            color: "#aaa",
          },
          "&:focus": {
            borderColor: "#999",
          },
        }}
      >
        {formDescription}
      </Typography>

      {questions.map(q => (
        <QuestionCard
          key={q.id}
          data={q}
          onDelete={() => deleteQuestion(q.id)}
          onChange={updated => updateQuestion(q.id, updated)}
        />
      ))}

      <Box textAlign="right" mt={2}>
        <Tooltip title="Add Question">
          <Fab size="small" color="primary" onClick={() => addQuestion()}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>

      <Box sx={{ height: 180 }} />

      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          display: "flex",
          justifyContent: "flex-end",
          gap: 4,
          mt: 5,
          background: "#fff",
           pt: 3
        }}
      >
          <Button
          onClick={handleCancel}
          color="secondary"
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
  onClick={saveForm}
  variant="contained"
  disabled={loading || isAnyFieldEmpty()}
  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
  sx={{ minWidth: 90 }} 
>
  {existingFormId ? "Update" : "Save"}
</Button>

      
      </Box>
    </>
  );
}
