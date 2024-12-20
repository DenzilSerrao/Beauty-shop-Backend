export const logger = {
  error: (err, req = null) => {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      path: req?.path,
      method: req?.method,
      timestamp: new Date().toISOString()
    });
  },
  info: (message, data = {}) => {
    console.log('Info:', {
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};