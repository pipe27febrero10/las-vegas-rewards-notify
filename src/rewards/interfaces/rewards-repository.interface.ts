import { Reward, RewardDTO } from "../dtos/rewards.dto"

export interface IRewardsRepository{
    getRewards(): Reward[]
    saveReward(reward: RewardDTO): Reward
}