export interface CartItemDto {
  id: string;
  seatId: string;
  seatNumber: string;
  sectionName: string;
  price: number;
  quantity: number;
  addedAt: Date;
}


export interface AddToCartRequest {
  eventId: string;
  seatIds: string[];  
  sessionId: string;
}

export interface CheckoutRequest {
  cartId: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface OrderResultDto {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  ticketCount: number;
  tickets?: Array<{
    ticketNumber: string;
    seat: string;
    section: string;
  }>;
}


export interface CartItemDto {
  id: string;
  seatId: string;
  seatNumber: string;
  sectionName: string;
  price: number;
  quantity: number;
  addedAt: Date;
}

export interface CartSummaryDto {
  cartId?: string;
  eventId?: string;
  seatCount: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  seats: Array<{
    seatId: string;
    seatNumber: string;
    section: string;
    price: number;
  }>;
}

export interface CheckoutRequest {
  cartId: string;
  fullName: string;
  email: string;
  phone: string;
  postcode : string;
}

export interface OrderResultDto {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  ticketCount: number;
  tickets?: Array<{
    ticketNumber: string;
    seat: string;
    section: string;
  }>;
}

// Response interfaces
export interface CartDetailsResponse {
  success: boolean;
  data?: {
    cartId: string;
    eventId: string;
    seatCount: number;
    subtotal: number;
    serviceFee: number;
    total: number;
    expiresAt: string;
    seats: Array<{
      seatId: string;
      seatNumber: string;
      section: string;
      price: number;
    }>;
  };
  error?: string;
}

export interface CheckoutResponse {
  success: boolean;
  data?: OrderResultDto;
  error?: string;
}

export interface OrderConfirmationResponse {
  success: boolean;
  data?: any;
  error?: string;
}