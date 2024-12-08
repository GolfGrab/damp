import { Config } from '@/utils/config/config-dto';
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AuthService,
      inject: [Config, PrismaService],
      useFactory: (config: Config, prisma: PrismaService) => {
        // const issuer = await Issuer.discover(config.OAUTH_URL);
        // const client = new issuer.Client({
        //   client_id: config.CLIENT_ID,
        //   client_secret: config.CLIENT_SECRET,
        // });
        // return new AuthService(client, prisma);
        return new AuthService(prisma);
      },
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
