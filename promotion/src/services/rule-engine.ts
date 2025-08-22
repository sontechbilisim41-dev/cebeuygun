import { RuleCondition, RuleEffect, Customer, Cart, CartItem, Money } from '@/types';
import { logger } from '@/utils/logger';
import { isWithinInterval, parseISO } from 'date-fns';

export class RuleEngine {
  /**
   * Evaluate if all conditions in a rule are met
   */
  evaluateConditions(conditions: RuleCondition[], customer: Customer, cart: Cart, context?: any): boolean {
    try {
      for (const condition of conditions) {
        if (!this.evaluateCondition(condition, customer, cart, context)) {
          return false;
        }
      }
      return true;
    } catch (error) {
      logger.error('Error evaluating conditions:', error);
      return false;
    }
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: RuleCondition, customer: Customer, cart: Cart, context?: any): boolean {
    const { type, operator, value, field } = condition;

    let actualValue: any;

    // Extract the actual value based on condition type
    switch (type) {
      case 'user_role':
        actualValue = customer.role;
        break;
      case 'location':
        actualValue = field === 'city' ? customer.location?.city : 
                     field === 'district' ? customer.location?.district :
                     field === 'country' ? customer.location?.country : 
                     customer.location?.city; // default to city
        break;
      case 'time':
        actualValue = new Date();
        break;
      case 'cart_total':
        actualValue = cart.totalAmount.amount;
        break;
      case 'product_tags':
        actualValue = cart.items.flatMap(item => item.tags);
        break;
      case 'product_categories':
        actualValue = cart.items.map(item => item.categoryId);
        break;
      case 'order_count':
        actualValue = customer.totalOrders;
        break;
      case 'customer_segment':
        actualValue = customer.segment;
        break;
      default:
        logger.warn(`Unknown condition type: ${type}`);
        return false;
    }

    // Apply the operator
    return this.applyOperator(actualValue, operator, value);
  }

  /**
   * Apply comparison operator
   */
  private applyOperator(actualValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return actualValue === expectedValue;
      case 'not_equals':
        return actualValue !== expectedValue;
      case 'greater_than':
        return actualValue > expectedValue;
      case 'less_than':
        return actualValue < expectedValue;
      case 'greater_equal':
        return actualValue >= expectedValue;
      case 'less_equal':
        return actualValue <= expectedValue;
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(actualValue);
      case 'contains':
        if (Array.isArray(actualValue)) {
          return Array.isArray(expectedValue) 
            ? expectedValue.some(val => actualValue.includes(val))
            : actualValue.includes(expectedValue);
        }
        return String(actualValue).includes(String(expectedValue));
      case 'between':
        if (Array.isArray(expectedValue) && expectedValue.length === 2) {
          return actualValue >= expectedValue[0] && actualValue <= expectedValue[1];
        }
        return false;
      default:
        logger.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }

  /**
   * Apply effects to calculate discount
   */
  applyEffects(effects: RuleEffect[], customer: Customer, cart: Cart): {
    discountAmount: Money;
    deliveryDiscount: Money;
    generatedCoupons: any[];
    loyaltyPoints: number;
  } {
    let totalDiscount = 0;
    let deliveryDiscount = 0;
    const generatedCoupons: any[] = [];
    let loyaltyPoints = 0;

    for (const effect of effects) {
      switch (effect.type) {
        case 'percentage_discount':
          if (effect.target === 'cart_total') {
            const discount = Math.round(cart.subtotal.amount * (effect.value / 100));
            totalDiscount += discount;
          } else if (effect.target === 'delivery_fee') {
            const discount = Math.round(cart.deliveryFee.amount * (effect.value / 100));
            deliveryDiscount += discount;
          }
          break;

        case 'flat_discount':
          if (effect.target === 'cart_total') {
            totalDiscount += effect.value * 100; // Convert to cents
          } else if (effect.target === 'delivery_fee') {
            deliveryDiscount += Math.min(effect.value * 100, cart.deliveryFee.amount);
          }
          break;

        case 'free_delivery':
          deliveryDiscount = cart.deliveryFee.amount;
          break;

        case 'generate_coupon':
          const coupon = this.generateCoupon(effect, customer);
          generatedCoupons.push(coupon);
          break;

        case 'loyalty_points':
          loyaltyPoints += effect.value;
          break;
      }
    }

    return {
      discountAmount: { amount: totalDiscount, currency: cart.totalAmount.currency },
      deliveryDiscount: { amount: deliveryDiscount, currency: cart.deliveryFee.currency },
      generatedCoupons,
      loyaltyPoints,
    };
  }

  /**
   * Generate coupon from effect
   */
  private generateCoupon(effect: RuleEffect, customer: Customer): any {
    const code = this.generateCouponCode();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30); // 30 days validity

    return {
      code,
      discountType: effect.metadata?.discountType || 'percentage',
      discountValue: effect.value,
      validUntil: validUntil.toISOString(),
      customerId: customer.id,
    };
  }

  /**
   * Generate unique coupon code
   */
  private generateCouponCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Validate time-based conditions
   */
  private isTimeConditionMet(condition: RuleCondition): boolean {
    const now = new Date();
    
    if (condition.field === 'hour') {
      const currentHour = now.getHours();
      return this.applyOperator(currentHour, condition.operator, condition.value);
    }
    
    if (condition.field === 'day_of_week') {
      const currentDay = now.getDay(); // 0 = Sunday
      return this.applyOperator(currentDay, condition.operator, condition.value);
    }
    
    if (condition.field === 'date_range') {
      const [startDate, endDate] = condition.value;
      return isWithinInterval(now, {
        start: parseISO(startDate),
        end: parseISO(endDate),
      });
    }
    
    return true;
  }

  /**
   * Check if customer is eligible for first-order promotion
   */
  private isFirstOrderCustomer(customer: Customer): boolean {
    return customer.totalOrders === 0;
  }

  /**
   * Calculate loyalty tier discount
   */
  private calculateLoyaltyDiscount(customer: Customer, cart: Cart): number {
    const totalSpent = customer.totalSpent.amount;
    
    if (totalSpent >= 100000) { // 1000 TRY
      return Math.round(cart.subtotal.amount * 0.15); // 15% for VIP
    } else if (totalSpent >= 50000) { // 500 TRY
      return Math.round(cart.subtotal.amount * 0.10); // 10% for Premium
    } else if (totalSpent >= 20000) { // 200 TRY
      return Math.round(cart.subtotal.amount * 0.05); // 5% for Regular
    }
    
    return 0;
  }
}