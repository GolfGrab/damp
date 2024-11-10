import { Config } from '@/utils/config/config-dto';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Issuer } from 'openid-client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

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
      inject: [Config],
      useFactory: async (config: Config) => {
        const issuer = await Issuer.discover(config.OAUTH_URL);
        const client = new issuer.Client({
          client_id: config.CLIENT_ID,
          client_secret: config.CLIENT_SECRET,
        });
        return new AuthService(client);
      },
    },
  ],
})
export class AuthModule {}
