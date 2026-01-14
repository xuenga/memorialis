export default async function handleStripeWebhook(event, context) {
  const stripe = require('stripe')(context.secrets.STRIPE_SECRET_KEY);
  const sig = event.headers['stripe-signature'];
  
  let stripeEvent;
  
  try {
    // Vérifier la signature du webhook
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      context.secrets.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }
  
  // Gérer l'événement
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    
    // Récupérer les données de la commande
    const items = JSON.parse(session.metadata.items);
    const customerName = session.metadata.customer_name;
    
    // Créer la commande
    const orderNumber = `MEM-${Date.now()}`;
    const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const shippingCost = subtotal >= 100 ? 0 : 9.90;
    const total = subtotal + shippingCost;
    
    // Générer un code d'accès unique pour le mémorial
    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Créer le mémorial
    const memorial = await context.api.asServiceRole.entities.Memorial.create({
      name: items[0].personalization?.deceased_name || 'Mémorial',
      access_code: accessCode,
      owner_email: session.customer_email,
      allow_comments: true,
      require_moderation: true,
      is_public: false,
      theme: 'classic',
    });
    
    // Générer le QR code
    const memorialUrl = `${context.appUrl}/ViewMemorial?id=${memorial.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(memorialUrl)}`;
    
    // Mettre à jour le mémorial avec le QR code
    await context.api.asServiceRole.entities.Memorial.update(memorial.id, {
      qr_code_url: qrCodeUrl,
    });
    
    // Créer la commande
    await context.api.asServiceRole.entities.Order.create({
      order_number: orderNumber,
      customer_email: session.customer_email,
      customer_name: customerName,
      items: items,
      subtotal: subtotal,
      shipping_cost: shippingCost,
      total: total,
      status: 'paid',
      memorial_id: memorial.id,
      stripe_payment_id: session.payment_intent,
      personalization: items[0].personalization || {},
    });
    
    // Envoyer un email de confirmation
    await context.api.integrations.Core.SendEmail({
      to: session.customer_email,
      subject: `Confirmation de commande ${orderNumber}`,
      body: `
Bonjour ${customerName},

Votre commande ${orderNumber} a été confirmée avec succès !

Votre mémorial a été créé. Voici votre code d'accès : ${accessCode}

Accédez à votre mémorial pour le personnaliser :
${memorialUrl}

Vous recevrez votre plaque sous 5 à 7 jours ouvrés.

Merci de votre confiance,
L'équipe Memorialis
      `,
    });
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
}

export const config = {
  type: 'function',
  name: 'handleStripeWebhook',
};
