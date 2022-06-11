import { Module } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { IRewardsRepository } from './interfaces/rewards-repository.interface';
import { RewardsRepositoryInMemory } from './rewards-in-memory.repository';
import { CredentialsModule } from 'src/credentials/credentials.module';

@Module({
  providers: [RewardsService,{
    provide: 'IRewardsRepository',
    useClass: RewardsRepositoryInMemory
  }],
  imports: [CredentialsModule],
  exports: [RewardsService]
})
export class RewardsModule {}
