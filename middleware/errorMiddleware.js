

const errorMiddleware = (err, req, res, next) => {
  console.error("🔥 Error:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  /**
   * 🔹 Twilio Errors
   */
  if (err.code && typeof err.code === "number") {
    switch (err.code) {
      case 20429: // Too many requests
        statusCode = 429;
        message = "Too many OTP requests. Please try again later.";
        break;

      case 60200: // Invalid parameter
        statusCode = 400;
        message = "Invalid verification request.";
        break;

      case 60203: // Max check attempts reached
        statusCode = 429;
        message = "Maximum OTP verification attempts reached.";
        break;

      case 60410: // Number blocked
        statusCode = 403;
        message =
          "This phone number is temporarily blocked. Please try another number.";
        break;

      case 60217: // Email mailer not configured
        statusCode = 400;
        message =
          "Email verification is not configured. Contact support.";
        break;

      default:
        statusCode = err.status || 500;
        message = err.message || "Twilio verification error.";
    }
  }

  /**
   * 🔹 JWT Errors
   */
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorMiddleware;