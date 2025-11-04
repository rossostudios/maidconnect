export type PaymentMethod = {
  id: string;
  type: "card";
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
};

export type PaymentIntent = {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
};

export type CreatePaymentIntentParams = {
  amount: number;
  currency?: string;
  bookingId?: string;
  description?: string;
};

export type SetupIntent = {
  id: string;
  clientSecret: string;
};
