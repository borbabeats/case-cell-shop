import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = 'logs';

// Formato personalizado para os logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Formato para console (mais legível)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
  }),
);

const transports: winston.transport[] = [
  // Console output
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// Adicionar transporte de arquivo apenas se não estiver em ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  // Arquivo de log geral
  transports.push(
    new DailyRotateFile({
      filename: `${logDir}/application-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
    }),
  );

  // Arquivo de log apenas para erros
  transports.push(
    new DailyRotateFile({
      level: 'error',
      filename: `${logDir}/error-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat,
    }),
  );
}

export const winstonConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
};

export const logger = winston.createLogger(winstonConfig);
