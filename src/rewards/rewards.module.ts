import { Module } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { IRewardsRepository } from './interfaces/rewards-repository.interface';
import { RewardsRepositoryInMemory } from './rewards-in-memory.repository';

@Module({
  providers: [RewardsService,{
    provide: 'IRewardsRepository',
    useClass: RewardsRepositoryInMemory
  }],
  exports: [RewardsService]
})
export class RewardsModule {}
