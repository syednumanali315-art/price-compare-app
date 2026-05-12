const winston = require("winston");

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
  new winston.transports.File({ filename: "logs/error.log", level: "error" }),
  new winston.transports.File({ filename: "logs/combined.log" }),
];

// Add CloudWatch transport in production
if (process.env.NODE_ENV === "production") {
  const WinstonCloudWatch = require("winston-cloudwatch");
  transports.push(
    new WinstonCloudWatch({
      logGroupName: "/pricecomparehub/backend",
      logStreamName: `backend-${new Date().toISOString().split("T")[0]}`,
      awsRegion: process.env.AWS_REGION || "ap-south-1",
      messageFormatter: ({ level, message, ...meta }) =>
        `[${level}] ${message} ${JSON.stringify(meta)}`,
    })
  );
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  transports,
});

module.exports = logger;
