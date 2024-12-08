import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseJsonPipe
  implements PipeTransform<string, Record<string, any>>
{
  transform(value: unknown, metadata: ArgumentMetadata): Record<string, any> {
    if (typeof value !== 'string') {
      return value as Record<string, any>;
    }
    const propertyName = metadata.data;
    try {
      return JSON.parse(value);
    } catch (e) {
      throw new BadRequestException(`${propertyName} contains invalid JSON `);
    }
  }
}
