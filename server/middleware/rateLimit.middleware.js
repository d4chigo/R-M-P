const rateLimit = require('express-rate-limit');

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP cada 15 minutos
  message: {
    success: false,
    message: "Demasiados intentos de recuperación. Intenta de nuevo en 15 minutos."
  }
});

module.exports = { forgotPasswordLimiter };