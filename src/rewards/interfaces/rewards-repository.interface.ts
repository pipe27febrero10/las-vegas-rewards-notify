import { Reward, RewardDTO } from "../dtos/reward.dto"

export interface IRewardsRepository{
    getRewards(): Reward[]
    saveReward(reward: RewardDTO): Reward
}