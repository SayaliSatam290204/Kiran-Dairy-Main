export const generateBillNo = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `BILL-${timestamp}-${random}`;
};
