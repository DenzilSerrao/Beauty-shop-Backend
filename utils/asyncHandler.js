export const asyncHandler = (fn) => (req, res) => {
  Promise.resolve(fn(req, res)).catch((err) => {
    // Make sure to send a proper response in case of an error
    console.error('Error in asyncHandler:', err); // Log the error for debugging purposes
    res.status(500).json({
      status: 'error',
      message: err.message || 'Internal Server Error',
    });
  });
};