import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RequestLogger');

  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    const startTime = Date.now();
    const getLogMessage = () =>
      `[${req.method}] ${req.url} - ${res.statusCode} - [${
        Date.now() - startTime
      }ms] - ${res.statusMessage}}`;

    res.on('finish', () => {
      const statusCode = res.statusCode;
      if (statusCode >= 500) {
        this.logger.error(getLogMessage());
      }

      if (statusCode >= 400 && statusCode < 500) {
        this.logger.warn(getLogMessage());
      }

      if (statusCode < 400) {
        this.logger.log(getLogMessage());
      }
    });

    next();
  }
}
