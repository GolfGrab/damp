import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions,
} from 'nest-winston';
import { format, transports } from 'winston';
import 'winston-daily-rotate-file';

export const loggerOption = {
  transports: [
    // error logs daily rotate file
    new transports.DailyRotateFile({
      // %DATE will be replaced by the current date
      filename: 'logs/%DATE%-error.log',
      level: 'error',
      format: format.combine(format.timestamp(), format.json()),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxFiles: '30d', // keep logs for 30 days
    }),

    // combined logs daily rotate file
    new transports.DailyRotateFile({
      // %DATE will be replaced by the current date
      filename: 'logs/%DATE%-combined.log',
      format: format.combine(format.timestamp(), format.json()),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxFiles: '30d', // keep logs for 30 days
    }),

    // console logs
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.ms(),
        nestWinstonModuleUtilities.format.nestLike('NestJS', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
  ],
} satisfies WinstonModuleOptions;
