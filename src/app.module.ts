import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RewardsModule } from './rewards/rewards.module';
import { CredentialsModule } from './credentials/credentials.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [RewardsModule, CredentialsModule,ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
