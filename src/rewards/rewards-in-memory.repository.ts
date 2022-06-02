import { Injectable } from '@nestjs/common';
import { Reward, RewardDTO } from './dtos/rewards.dto';
import { IRewardsRepository } from './interfaces/rewards-repository.interface';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RewardsRepositoryInMemory implements IRewardsRepository{
    private rewards: Reward[] = [];
    constructor(){}
    getRewards(): Reward[]{
        return this.rewards;
    }

    saveReward(rewardDTO: RewardDTO): Reward{
        const createdAt : string = DateTime.utc().toISO();
        const id = uuidv4();
        const reward : Reward = {
            id,
            createdAt,
            ...rewardDTO
        };
        this.rewards = [...this.rewards, reward]
        return reward;
    }
}
