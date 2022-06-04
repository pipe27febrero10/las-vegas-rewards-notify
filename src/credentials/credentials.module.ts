import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CredentialsService } from './credentials.service';
import { CredentialsRepositoryInMemory } from './credentials-in-memory.repository';

@Module({
  providers: [CredentialsService, {
    provide: 'ICredentialsRepository',
    useClass: CredentialsRepositoryInMemory,
  }],
  imports: [ConfigModule],
  exports: [CredentialsService]
})
export class CredentialsModule {}
