import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CredentialsService } from './credentials.service';

@Module({
  providers: [CredentialsService],
  imports: [ConfigModule],
  exports: [CredentialsService]
})
export class CredentialsModule {}
