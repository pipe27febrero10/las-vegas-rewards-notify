import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CredentialsService } from 'src/credentials/credentials.service';
import { RewardsService } from 'src/rewards/rewards.service';
import { DateTime } from 'luxon';
import { Reward } from 'src/rewards/dtos/reward.dto';
import { RewardsPrizes } from 'src/rewards/constants/configuration';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(private readonly credentialsService: CredentialsService, private readonly rewardsService: RewardsService
      ,private readonly notificationsService: NotificationsService) { }
  @Cron('*/20 * * * * *')
  async handleCron() {
    console.log('Cron job started');
    const tokenNeedsRefresh = await this.tokenNeedsRefresh();
    console.log('Token needs refresh: ', tokenNeedsRefresh);
    if (tokenNeedsRefresh) await this.refreshToken();
    const rewardsUpdated = await this.updateRewards();
    await this.notifyAvailableRewards(rewardsUpdated);
    console.log('Cron job ended');
  }

  async tokenNeedsRefresh(): Promise<boolean> {
    const { expiresAt } = await this.credentialsService.getLastCredential() || {};
    if (!expiresAt) return true;
    const now = DateTime.utc().toISO();
    const tokenNeedToBeRefreshed = DateTime.fromISO(expiresAt).diff(DateTime.fromISO(now)).milliseconds < 600000;
    return tokenNeedToBeRefreshed;
  }

  async refreshToken(): Promise<void> {
    const accessToken = await this.credentialsService.getAccessToken();
    await this.credentialsService.createAccessToken(accessToken, 60);
  }

  async updateRewards(): Promise<Reward[]> {
    return this.rewardsService.updateRewards([RewardsPrizes.TOURNAMENT_OF_KINGS, RewardsPrizes.MANDALAY_BAY_ACUARIUM, RewardsPrizes.MADAME_TUSSAUDS_MUSEUM, RewardsPrizes.HALF_PRICE_BUFFET_BELLAGIO]);
  }

  async notifyAvailableRewards(rewards : Reward[]): Promise<void> {
    const rewardsAvailable = rewards.filter(reward => reward.quantityRemaining > 0 && (reward.offerId === RewardsPrizes.TOURNAMENT_OF_KINGS));
    if(rewardsAvailable.length > 0) {
      const message = rewardsAvailable.reduce((acc, reward) => acc + `Nombre recompensa: ${reward.name} Cantidad disponible: ${reward.quantityRemaining ? reward.quantityRemaining : 'No hay limite de stock'} \n`,'')
      this.notificationsService.sendMessage(message, `+56993533809`);
      this.notificationsService.sendMessage(message,`+56984433012`)
    }
    else{
      console.log('No rewards available')
    } 
  }
}
