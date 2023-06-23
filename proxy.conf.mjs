import winston from "winston";

const logProvider = () => {
  return winston.createLogger({
    level: "debug",
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.simple()
    ),
    transports: [new winston.transports.Console()],
  });
}

export default {
  "/api/*": {
    target: "https://lemmy.world",
    changeOrigin: true,
    secure: true,
    "pathRewrite": {
      "^/api/lemmy.world": ""
    },
    logLevel: "debug",
    logProvider: logProvider,
    
  }
};