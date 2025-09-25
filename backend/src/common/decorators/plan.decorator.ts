import { SetMetadata } from '@nestjs/common';
import { SubscriptionPlan } from '@prisma/client';

export const RequirePlan = (plan: SubscriptionPlan) => SetMetadata('plan', plan);