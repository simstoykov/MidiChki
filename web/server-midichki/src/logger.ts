import winston from 'winston';

const consoleTransport = new winston.transports.Console();
const myWinstonOptions = {
  transports: [consoleTransport],
  format: winston.format.simple()
};
const logger = winston.createLogger(myWinstonOptions);
export default logger;
