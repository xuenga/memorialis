export default async function handleStripeWebhook(event: any, context: any) {
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
  } catch (err: any) {
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
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);
    const shippingCost = subtotal >= 100 ? 0 : 9.90;
    const total = subtotal + shippingCost;

    // ====== NOUVEAU : Réserver un QR code disponible ======

    // Trouver un QR code disponible
    let qrCode = null;
    try {
      const availableQRCodes = await context.api.asServiceRole.entities.QRCode.filter({
        status: 'available'
      });

      if (availableQRCodes.length > 0) {
        qrCode = availableQRCodes[0];
      } else {
        console.error('ERREUR: Aucun QR code disponible en stock!');
        // TODO: Alerter l'admin par email
      }
    } catch (e) {
      console.error('Erreur lors de la recherche de QR code:', e);
    }

    // Code d'accès = code QR si disponible, sinon généré
    const accessCode = qrCode?.code || Math.random().toString(36).substring(2, 8).toUpperCase();

    // Créer le mémorial (non activé, en attente du premier scan)
    const memorial = await context.api.asServiceRole.entities.Memorial.create({
      name: items[0].personalization?.deceased_name || 'Mémorial',
      access_code: accessCode,
      owner_email: session.customer_email,
      allow_comments: true,
      require_moderation: true,
      is_public: false,
      is_activated: false,  // Sera activé au premier scan de la plaque
      theme: 'classic',
    });

    // URL de redirection QR (utilise le nouveau système /qr/:code)
    const qrRedirectUrl = qrCode
      ? `${context.appUrl}/qr/${qrCode.code}`
      : `${context.appUrl}/memorial/${memorial.id}`;

    // Générer l'image QR code pour référence admin
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrRedirectUrl)}`;

    // Mettre à jour le mémorial avec l'URL du QR code
    await context.api.asServiceRole.entities.Memorial.update(memorial.id, {
      qr_code_url: qrCodeImageUrl,
    });

    // Créer la commande d'abord pour avoir l'ID
    const order = await context.api.asServiceRole.entities.Order.create({
      order_number: orderNumber,
      customer_email: session.customer_email,
      customer_name: customerName,
      items: items,
      subtotal: subtotal,
      shipping_cost: shippingCost,
      total: total,
      status: 'paid',
      memorial_id: memorial.id,
      qr_code: qrCode?.code || null,
      stripe_payment_id: session.payment_intent,
      personalization: items[0].personalization || {},
    });

    // Réserver le QR code (lier au mémorial et à la commande)
    if (qrCode) {
      await context.api.asServiceRole.entities.QRCode.update(qrCode.id, {
        status: 'reserved',
        memorial_id: memorial.id,
        order_id: order.id,
        owner_email: session.customer_email,
        reserved_at: new Date().toISOString(),
      });
    }

    // Envoyer un email de confirmation
    await context.api.integrations.Core.SendEmail({
      to: session.customer_email,
      subject: `Confirmation de commande ${orderNumber}`,
      body: `
Bonjour ${customerName},

Votre commande ${orderNumber} a été confirmée avec succès !

╔════════════════════════════════════════════╗
║  VOTRE CODE QR UNIQUE : ${accessCode}      ║
╚════════════════════════════════════════════╝

Ce code est gravé sur votre plaque mémorielle.
Lorsque vous la recevrez, scannez le QR code pour activer votre espace mémorial.

Vous recevrez votre plaque sous 5 à 7 jours ouvrés.

En attendant, vous pouvez accéder à votre espace sur :
${context.appUrl}/my-memorials
Utilisez le code ${accessCode} pour y accéder.

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
