'use client';
import { useSearchParam } from 'react-use';
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import DataTable from '@/views/common/DataTable';
import formService from '@/@services/formService';

export default function MyAssignmentsPage() {
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');

  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await formService.getMyAssignments(1, 50);
      if (res?.data?.success) {
        let assignments = res.data.data;
        if (assignmentId) {
          assignments = assignments.filter(a => a.assignmentId === assignmentId);
        }
        setForms(assignments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [assignmentId]);

  if (loading) return <CircularProgress />;
  if (forms.length === 0) return <Typography>No assigned forms found 🚫</Typography>;

  const columns = [
    { label: 'Form Title', field: 'formTitle' },
    { label: 'Due Date', field: 'dueDate' },
    { label: 'Status', field: 'status' }
  ];

  return (
    <DataTable
      data={forms}
      columns={columns}
      showActions={true}
        actionProps={{
    view: {
      onClick: handleViewClick
    }
  }}
    />
  );
}
