import { Inject, Injectable } from '@nestjs/common';
import { Reward, RewardDTO } from './dtos/rewards.dto';
import { IRewardsRepository } from './interfaces/rewards-repository.interface';

@Injectable()
export class RewardsService {
    constructor(@Inject('IRewardsRepository') private readonly rewardsRepository : IRewardsRepository){}

    async getRewards(): Promise<Reward[]> {
        return this.rewardsRepository.getRewards();
    }
    
    async createReward(rewardDTO: RewardDTO): Promise<Reward> {
        return this.rewardsRepository.saveReward(rewardDTO);
    }
}
