import { Inject, Injectable } from '@nestjs/common';
import { Reward, RewardClientResponse, RewardDTO } from './dtos/reward.dto';
import { IRewardsRepository } from './interfaces/rewards-repository.interface';
import axios from 'axios';
import { RewardsPrizes } from './constants/configuration';
import { CredentialsService } from 'src/credentials/credentials.service';

@Injectable()
export class RewardsService {
    private configRewardsHeaders = {
        headers: {}
    }
    constructor(@Inject('IRewardsRepository') private readonly rewardsRepository : IRewardsRepository, private readonly credentialsService: CredentialsService){
        this.configRewardsHeaders = {
            headers: {
              'X-AVA-DAB': '3_25_0', 
              'X-PSA-ID': '8482689',
              'traceparent': '00-9e00f0d910211fc98f2f9ac850bd0440-db95d1977dc7ee45-00'
            }
        };
    }

    async getRewards(): Promise<Reward[]> {
        return this.rewardsRepository.getRewards();
    }
    
    async createReward(rewardDTO: RewardDTO): Promise<Reward> {
        return this.rewardsRepository.saveReward(rewardDTO);
    }

    async updateRewards(rewardsPrizes: RewardsPrizes[]) : Promise<Reward[]> {
        const accessToken = await this.credentialsService.getLastAccessToken();
        if(!accessToken) throw new Error('No access token found');
        const sesionToken = await this.credentialsService.getSessionToken(accessToken)
        this.setToken(sesionToken);
        const rewardResponses  = await Promise.all(rewardsPrizes.map(async (rewardPrize: RewardsPrizes) => await axios.get(`https://mvmx.playstudios.com/api/rewards/${rewardPrize}`,this.configRewardsHeaders)))
        const rewardClientResponses : RewardClientResponse[] = rewardResponses.map(rewardResponse => rewardResponse.data);
        const rewardsDTOtoCreate = this.toRewardDTO(rewardClientResponses);
        let rewardsCreated = [];
        for(const rewardDTO of rewardsDTOtoCreate) {
           const rewardCreated = await this.createReward(rewardDTO);
           rewardsCreated = [...rewardsCreated, rewardCreated];
        }
        return rewardsCreated;
    }

    async setToken(accessToken: string) : Promise<void> {
        this.configRewardsHeaders.headers['Authorization'] = `Token ${accessToken}`;
    }

    toRewardDTO(rewardClientResponse : RewardClientResponse[]): RewardDTO[] {
        return rewardClientResponse.map(({OfferId, QuantityRemaining, Cost, Name, IsQuantityLimitedByDailyLimit}) => ({
            offerId: OfferId,
            ...QuantityRemaining > -Infinity && {quantityRemaining: QuantityRemaining},
            cost: Cost,
            name: Name,
            isQuantityLimitedByDailyLimit: IsQuantityLimitedByDailyLimit
        }));
    }
}