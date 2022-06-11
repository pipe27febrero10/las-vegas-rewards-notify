import { Module } from '@nestjs/common';
import { CredentialsModule } from 'src/credentials/credentials.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { RewardsModule } from 'src/rewards/rewards.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [RewardsModule,CredentialsModule,NotificationsModule],
  providers: [TasksService]
})
export class TasksModule {}
