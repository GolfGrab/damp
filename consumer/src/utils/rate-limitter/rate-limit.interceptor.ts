import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RateLimitInterceptor.name);

  private rateLimitMap = global.rateLimitMap as
    | Map<
        string,
        {
          quota: number | undefined;
          expiredTime: Date;
        }
      >
    | undefined;

  constructor(
    private readonly name: string,
    private readonly config: {
      quota: number;
      timeWindowMs: number;
    },
  ) {
    if (!this.rateLimitMap) {
      global.rateLimitMap = new Map();
      this.rateLimitMap = global.rateLimitMap as typeof this.rateLimitMap;
    }

    this.rateLimitMap!.set(this.name, {
      quota: this.config.quota,
      expiredTime: new Date(Date.now() + this.config.timeWindowMs),
    });
  }

  consumeRateLimit(name: string) {
    const rateLimit = this.rateLimitMap?.get(name);
    if (!rateLimit) {
      throw new Error(`Rate limit not found for ${name}`);
    }

    const now = new Date();

    // if the time window has passed, reset the quota
    if (rateLimit.expiredTime.getTime() < now.getTime()) {
      rateLimit.quota = this.config.quota;
      rateLimit.expiredTime = new Date(
        now.getTime() + this.config.timeWindowMs,
      );
    }

    if (rateLimit.quota === 0) {
      return {
        tryAgainAfter: rateLimit.expiredTime.getTime() - now.getTime() + 10,
      };
    }

    rateLimit.quota! -= 1;

    this.rateLimitMap?.set(name, rateLimit);
    this.logger.log(
      `Consumed quota for ${name}. Remaining: ${rateLimit.quota}`,
    );

    return null;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    while (true) {
      const result = this.consumeRateLimit(this.name);
      if (!result) {
        break;
      }

      this.logger.error(
        `Rate limit exceeded for ${this.name}. Trying again in ${result.tryAgainAfter}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, result.tryAgainAfter));
    }

    return next.handle();
  }
}
