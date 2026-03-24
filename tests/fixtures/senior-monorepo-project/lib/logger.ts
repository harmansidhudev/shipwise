import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  ...(process.env.NODE_ENV === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "HH:MM:ss",
          },
        },
      }
    : {
        formatters: {
          level(label) {
            return { level: label };
          },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }),
  base: {
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "body.password",
      "body.token",
      "body.secret",
    ],
    censor: "[REDACTED]",
  },
});
