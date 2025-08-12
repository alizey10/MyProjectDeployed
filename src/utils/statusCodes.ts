export const getStatusCode = (res: any): number | undefined => {
  return res?.response?.data?.statusCode || res?.data?.statusCode;
};

export const getMessage = (res: any): string => {
  return (
    res?.response?.data?.message ||
    res?.data?.message ||
    'Something went wrong.'
  );
};
