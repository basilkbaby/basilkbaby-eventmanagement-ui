export interface CouponData {
  code: string;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  isValid: boolean;
  description?: string;
}


export interface CouponRequest {
  couponCode: string;
  cartId: string;
}

export interface CouponResponse {
  success: boolean;
  data?: {
    code: string;
    discountAmount: number;
    discountType: 'percentage' | 'fixed';
    description?: string;
  };
  error?: string;
}