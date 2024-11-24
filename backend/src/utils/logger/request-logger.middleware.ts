import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RequestLogger');

  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    res.on('finish', () => {
      const statusCode = res.statusCode;
      if (statusCode >= 500) {
        this.logger.error(
          `[${req.method}] ${req.url} - ${statusCode} - ${res.statusMessage}}`,
        );
      }

      if (statusCode >= 400 && statusCode < 500) {
        this.logger.warn(
          `[${req.method}] ${req.url} - ${statusCode} - ${res.statusMessage}}`,
        );
      }

      if (statusCode < 400) {
        this.logger.log(
          `[${req.method}] ${req.url} - ${statusCode} - ${res.statusMessage}`,
        );
      }
    });

    next();
  }
}
