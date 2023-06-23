// const winston = require('winston');
import winston from "winston";

const logProvider = () => {
  return winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.simple()
    ),
    transports: [new winston.transports.Console()],
  });
}

export default {
  '/api/*': {
    target: "https://lemmy.world",
    router: (req) => req.originalUrl.replace("/api/", "https://"),
    changeOrigin: true,
    secure: true,
    pathRewrite: (path) => path.split("/").slice(4).join("/"),
    logLevel: 'debug',
    logProvider: logProvider,
  }
};