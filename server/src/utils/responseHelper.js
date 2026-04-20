export const responseHelper = {
  success: (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
      success: true,
      message,
      data
    });
  },

  error: (res, message = 'Error', statusCode = 500, data = null) => {
    res.status(statusCode).json({
      success: false,
      message,
      ...(data && { data })
    });
  }
};
