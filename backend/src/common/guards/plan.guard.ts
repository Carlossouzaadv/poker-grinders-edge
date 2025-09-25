import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionPlan } from '@prisma/client';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlan = this.reflector.getAllAndOverride<SubscriptionPlan>('plan', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPlan) {
      return true; // If no plan is required, allow access
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has required plan or higher
    if (requiredPlan === SubscriptionPlan.PRO && user.plan !== SubscriptionPlan.PRO) {
      throw new ForbiddenException('This feature requires a Pro subscription');
    }

    return true;
  }
}