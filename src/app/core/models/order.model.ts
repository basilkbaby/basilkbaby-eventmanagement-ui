export interface Order {
  orderId: string;
  orderNumber: string;
  customerName : string;
  customerEmail : string;
  customerPhone : string;
  customerPostCode : string;
  eventId : string;
  eventName : string;
  eventDate?: Date;
  venue : string;
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
  seats: OrderSeatDto[];
}

export interface OrderSeatDto{
    seatId: string;
    seatNumber: string;
    sectionName: string ;
    price: number;
    ticketNumber: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PaymentInfo {
  cardHolder: string;
  cardLastFour?: string;
  paymentMethod: string;
  transactionId?: string;
  stripePaymentIntentId?: string;
}

export interface OrderItem {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  venue: string;
  ticketType: string;
  quantity: number;
  price: number;
  seatInfo?: SeatInfo;
}

export interface SeatInfo {
  section: string;
  row: string;
  number: number;
  type: string;
}

export interface Ticket {
  id: string;
  orderId: string;
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  venue: string;
  type: string;
  price: number;
  quantity: number;
  seatInfo?: SeatInfo;
  status: 'valid' | 'used' | 'cancelled' | 'refunded';
  validUntil: Date;
  qrCode: string;
  createdAt: Date;
}

// For email sending
export interface TicketEmailData {
  order: Order;
  tickets: Ticket[];
  customer: CustomerInfo;
}