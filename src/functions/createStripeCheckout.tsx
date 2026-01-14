export default async function createStripeCheckout(event, context) {
  const { items, customer_email, customer_name, success_url, cancel_url } = event.body;
  
  const stripe = require('stripe')(context.secrets.STRIPE_SECRET_KEY);
  
  // Créer les line items pour Stripe
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.product_name,
        description: item.personalization?.deceased_name 
          ? `Personnalisé pour ${item.personalization.deceased_name}` 
          : undefined,
      },
      unit_amount: Math.round(item.price * 100), // Convertir en centimes
    },
    quantity: item.quantity || 1,
  }));
  
  // Ajouter les frais de port si nécessaire
  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shippingCost = subtotal >= 100 ? 0 : 9.90;
  
  if (shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Frais de livraison',
        },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    });
  }
  
  // Créer la session Stripe Checkout
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: success_url,
    cancel_url: cancel_url,
    customer_email: customer_email,
    metadata: {
      customer_name: customer_name,
      items: JSON.stringify(items),
    },
  });
  
  return {
    sessionId: session.id,
    url: session.url,
  };
}

export const config = {
  type: 'function',
  name: 'createStripeCheckout',
};
