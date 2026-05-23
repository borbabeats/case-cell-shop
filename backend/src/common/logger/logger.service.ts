import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { logger } from './winston.config';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  log(message: any, context?: string) {
    logger.info({ message, context });
  }

  error(message: any, trace?: string, context?: string) {
    logger.error({ message, trace, context });
  }

  warn(message: any, context?: string) {
    logger.warn({ message, context });
  }

  debug(message: any, context?: string) {
    logger.debug({ message, context });
  }

  verbose(message: any, context?: string) {
    logger.verbose({ message, context });
  }
}
