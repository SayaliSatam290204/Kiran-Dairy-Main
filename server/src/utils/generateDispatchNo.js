export const generateDispatchNo = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `DISP-${timestamp}-${random}`;
};
