export interface CheckoutRequest {
  priceId: string;
  userId: string;
  customerEmail: string;
  successUrl?: string;
  cancelUrl?: string;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateRequest(body: unknown): CheckoutRequest {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Invalid request body');
  }

  const request = body as Record<string, unknown>;
  const errors: string[] = [];

  // Validate priceId
  if (!request.priceId || typeof request.priceId !== 'string') {
    errors.push('Price ID is required');
  } else if (!request.priceId.startsWith('price_')) {
    errors.push('Invalid price ID format');
  }

  // Validate userId
  if (!request.userId || typeof request.userId !== 'string') {
    errors.push('User ID is required');
  } else if (request.userId.trim().length === 0) {
    errors.push('User ID cannot be empty');
  }

  // Validate customerEmail
  if (!request.customerEmail || typeof request.customerEmail !== 'string') {
    errors.push('Customer email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.customerEmail)) {
      errors.push('Invalid email format');
    }
  }

  // Optional URL validations
  if (request.successUrl && typeof request.successUrl !== 'string') {
    errors.push('Success URL must be a string');
  }
  if (request.cancelUrl && typeof request.cancelUrl !== 'string') {
    errors.push('Cancel URL must be a string');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  return {
    priceId: request.priceId as string,
    userId: request.userId as string,
    customerEmail: request.customerEmail as string,
    successUrl: request.successUrl as string | undefined,
    cancelUrl: request.cancelUrl as string | undefined
  };
}