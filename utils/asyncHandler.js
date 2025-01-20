export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    const result = await fn(req, res, next);
    return result; // Return the result if there is one
  } catch (err) {
    // Make sure to send a proper response in case of an error
    console.error(err); // Log the error for debugging purposes
    res.status(500).json({
      status: 'error',
      message: err.message || 'Internal Server Error',
    });
  }
};