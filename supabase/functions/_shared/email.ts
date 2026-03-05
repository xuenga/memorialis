// Deno type declaration for Edge Functions
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

interface OrderItem {
  product_name?: string;
  name?: string;
  quantity: number;
  price: number;
  personalization?: {
    deceased_name?: string;
    defunt_name?: string;
    birth_date?: string;
    death_date?: string;
    inscription?: string;
    photo_url?: string;
    access_code?: string;
  };
}

interface ShippingAddress {
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

interface OrderEmailData {
  email: string;
  customerName: string;
  orderNumber: string;
  accessCode: string;
  memorialLink: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress?: ShippingAddress | null;
}

export const sendOrderConfirmationEmail = async (
  email: string,
  customerName: string,
  orderNumber: string,
  accessCode: string,
  memorialLink: string,
  items: OrderItem[] = [],
  subtotal: number = 0,
  shippingCost: number = 0,
  total: number = 0,
  shippingAddress?: ShippingAddress | null,
  invitationLink?: string
) => {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return;
  }

  // Format currency
  const formatPrice = (price: any) => {
    const num = parseFloat(price);
    if (isNaN(num)) return '0.00 €';
    return `${num.toFixed(2)} €`;
  };

  // Safe calculation for item total
  const getItemTotal = (item: OrderItem) => {
    const price = parseFloat(String(item.price)) || 0;
    const qty = parseInt(String(item.quantity)) || 1;
    return price * qty;
  };

  // Generate items table rows
  const itemsRows = items.length > 0
    ? items.map(item => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left;">
            ${item.product_name || item.name || 'Produit Memorialis'}
            ${item.personalization?.deceased_name ? `<br><small style="color: #6b7280;">Pour : ${item.personalization.deceased_name}</small>` : ''}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity || 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(getItemTotal(item))}</td>
        </tr>
      `).join('')
    : `
        <tr>
          <td colspan="3" style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
            Plaque commémorative avec QR code
          </td>
        </tr>
      `;

  // Format shipping address
  const addressHtml = shippingAddress
    ? `
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h4 style="margin: 0 0 10px 0; color: #374151; font-size: 14px;">📦 Adresse de livraison</h4>
          <p style="margin: 0; color: #4b5563; font-size: 14px;">
            ${shippingAddress.street || ''}<br>
            ${shippingAddress.postal_code || ''} ${shippingAddress.city || ''}<br>
            ${shippingAddress.country || 'France'}
          </p>
        </div>
      `
    : '';

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2f4858 100%); padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Memorialis</h1>
          <p style="margin: 10px 0 0 0; color: #cbd5e1; font-size: 14px;">Gardez précieusement le souvenir de vos proches</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px 20px;">
          
          <!-- Thank you message -->
          <h2 style="color: #1e3a5f; margin: 0 0 10px 0; font-size: 22px;">Merci pour votre commande ! 🙏</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Bonjour <strong>${customerName}</strong>,<br>
            Nous avons bien reçu votre commande <strong style="color: #1e3a5f;">#${orderNumber}</strong>.
          </p>

          <!-- Memorial Code Box -->
          <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); border: 2px solid #f9a8d4; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
            <h3 style="margin: 0 0 15px 0; color: #be185d; font-size: 18px;">🌹 Votre Mémorial est Prêt</h3>
            
            <!-- QR Code Image -->
            <div style="margin: 20px 0;">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&format=png&data=${encodeURIComponent(`https://memorialis.shop/qr/${accessCode}`)}" 
                alt="QR Code du mémorial" 
                style="width: 180px; height: 180px; border-radius: 12px; border: 4px solid #ffffff; box-shadow: 0 4px 15px rgba(190, 24, 93, 0.2);"
              />
              <p style="color: #831843; font-size: 12px; margin: 10px 0 0 0;">
                Scannez ce QR code pour accéder au mémorial
              </p>
            </div>
            
            <p style="color: #831843; font-size: 14px; margin: 0 0 15px 0;">
              Conservez précieusement ce code d'accès :
            </p>
            <div style="background-color: #ffffff; padding: 15px 25px; border-radius: 8px; display: inline-block; border: 2px dashed #be185d;">
              <span style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #1e3a5f;">${accessCode}</span>
            </div>
            <p style="margin: 20px 0 0 0;">
              <a href="https://memorialis.shop/my-memorials" style="background: linear-gradient(135deg, #be185d 0%, #9d174d 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(190, 24, 93, 0.3);">
                ✨ Personnaliser mon mémorial
              </a>
            </p>
          </div>

          ${invitationLink ? `
          <!-- Account Setup Section -->
          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 2px solid #60a5fa; padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">🔐 Créez votre Espace Personnel</h3>
            <p style="color: #1e3a8a; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">
              Pour que vous puissiez gérer votre mémorial en toute sérénité, nous avons créé un compte sécurisé à votre nom.
              Cela vous permettra de modifier votre mémorial à tout moment, d'ajouter des photos et souvenirs, et de le personnaliser selon vos souhaits.
            </p>
            <p style="margin: 20px 0 0 0; text-align: center;">
              <a href="${invitationLink}" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                🔑 Créer mon mot de passe
              </a>
            </p>
            <p style="color: #475569; font-size: 13px; margin: 15px 0 0 0; text-align: center;">
              Ce lien est personnel et sécurisé. Il vous permettra de définir votre mot de passe en toute sécurité.
            </p>
          </div>
          ` : ''}

          <!-- Order Summary -->
          <h3 style="color: #1e3a5f; margin: 30px 0 15px 0; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            📋 Récapitulatif de votre commande
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left; font-size: 13px; color: #6b7280; text-transform: uppercase;">Produit</th>
                <th style="padding: 12px; text-align: center; font-size: 13px; color: #6b7280; text-transform: uppercase;">Qté</th>
                <th style="padding: 12px; text-align: right; font-size: 13px; color: #6b7280; text-transform: uppercase;">Prix</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <!-- Totals -->
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Sous-total</td>
                <td style="padding: 8px 0; text-align: right; color: #374151;">${formatPrice(subtotal || total)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Livraison</td>
                <td style="padding: 8px 0; text-align: right; color: ${shippingCost === 0 ? '#16a34a' : '#374151'};">${shippingCost === 0 ? 'Offerte' : formatPrice(shippingCost)}</td>
              </tr>
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="padding: 12px 0 0 0; color: #1e3a5f; font-weight: bold; font-size: 18px;">Total</td>
                <td style="padding: 12px 0 0 0; text-align: right; color: #1e3a5f; font-weight: bold; font-size: 18px;">${formatPrice(total)}</td>
              </tr>
            </table>
          </div>

          ${addressHtml}

          <!-- Next Steps -->
          <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #0369a1;">📱 Prochaines étapes</h4>
            <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
              <li>Personnalisez votre mémorial en ligne avec photos et souvenirs</li>
              <li>Recevez votre plaque commémorative avec QR code</li>
              <li>Placez la plaque sur le lieu de mémoire souhaité</li>
              <li>Scannez le QR code pour accéder au mémorial numérique</li>
            </ol>
          </div>

          <!-- Support -->
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 25px;">
            Si vous avez des questions, n'hésitez pas à nous contacter en répondant directement à cet email.
          </p>

        </div>

        <!-- Footer -->
        <div style="background-color: #1e3a5f; padding: 25px 20px; text-align: center;">
          <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 16px; font-weight: 600;">Memorialis</p>
          <p style="margin: 0; color: #94a3b8; font-size: 12px;">
            © ${new Date().getFullYear()} Memorialis - Tous droits réservés<br>
            <a href="https://memorialis.shop" style="color: #cbd5e1; text-decoration: none;">memorialis.shop</a>
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Memorialis <contact@memorialis.shop>',
        to: email,
        subject: `✅ Confirmation de commande #${orderNumber} - Memorialis`,
        html: html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', data);
      throw new Error(data.message || 'Failed to send email');
    }

    console.log('✅ Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendAdminNotificationEmail = async (
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  orderNumber: string,
  items: OrderItem[] = [],
  subtotal: number = 0,
  shippingCost: number = 0,
  total: number = 0,
  shippingAddress?: ShippingAddress | null
) => {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return;
  }

  const formatPrice = (price: any) => {
    const num = parseFloat(price);
    if (isNaN(num)) return '0.00 €';
    return `${num.toFixed(2)} €`;
  };

  const getItemTotal = (item: OrderItem) => {
    const price = parseFloat(String(item.price)) || 0;
    const qty = parseInt(String(item.quantity)) || 1;
    return price * qty;
  };

  const itemsRows = items.map(item => {
    const pers = item.personalization || {};
    const deceasedName = pers.deceased_name || pers.defunt_name || 'Non spécifié';

    // High-res QR Code URL (1000x1000 as requested)
    // Note: We don't have the explicit accessCode here, but we can try to find it in items or pass it.
    // In confirm-order/webhook, we know the access code. Let's adjust the interface to accept it or derive it.
    // Actually, each item might have a different QR? No, usually one memorial per order in this flow.
    // Let's assume one memorial for now as per current logic.

    return `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #ffffff;">
        <h4 style="margin: 0 0 10px 0; color: #1e3a5f; border-bottom: 1px solid #eee; padding-bottom: 5px;">
          ${item.product_name || item.name || 'Produit'} (Qté: ${item.quantity || 1})
        </h4>
        <p style="margin: 5px 0;"><strong>Défunt :</strong> ${deceasedName}</p>
        ${pers.birth_date || pers.death_date ? `<p style="margin: 5px 0;"><strong>Dates :</strong> ${pers.birth_date || '?'} - ${pers.death_date || '?'}</p>` : ''}
        
        <div style="background-color: #f8fafc; padding: 10px; border-radius: 4px; margin: 10px 0;">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: #475569;">Texte à graver :</p>
          <p style="margin: 0; font-style: italic; white-space: pre-wrap;">${pers.inscription || 'Aucun texte'}</p>
        </div>

        ${pers.photo_url ? `
          <div style="margin: 10px 0;">
            <p style="margin: 0 0 5px 0; font-weight: bold; color: #475569;">Photo Importée :</p>
            <a href="${pers.photo_url}" target="_blank">
              <img src="${pers.photo_url}" style="max-width: 200px; border-radius: 4px; border: 1px solid #ddd;" alt="Photo du défunt" />
            </a>
            <p style="margin: 5px 0;"><small><a href="${pers.photo_url}" target="_blank">Ouvrir l'image en plein écran</a></small></p>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  const adminHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f5; padding: 20px;">
      <div style="max-width: 700px; margin: 0 auto; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h1 style="color: #1e3a5f; margin-top: 0; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px;">🔔 Nouvelle Vente #${orderNumber}</h1>
        
        <div style="display: flex; gap: 20px; margin-bottom: 25px;">
          <div style="flex: 1; min-width: 250px;">
            <h3 style="color: #1e3a5f; margin-bottom: 10px;">👤 Information Client</h3>
            <p style="margin: 5px 0;"><strong>Nom :</strong> ${customerName}</p>
            <p style="margin: 5px 0;"><strong>Email :</strong> ${customerEmail}</p>
            <p style="margin: 5px 0;"><strong>Tél :</strong> ${customerPhone || 'Non fourni'}</p>
          </div>
          
          <div style="flex: 1; min-width: 250px;">
            <h3 style="color: #1e3a5f; margin-bottom: 10px;">📦 Livraison</h3>
            ${shippingAddress ? `
              <p style="margin: 0;">
                ${shippingAddress.street || ''}<br>
                ${shippingAddress.postal_code || ''} ${shippingAddress.city || ''}<br>
                ${shippingAddress.country || 'France'}
              </p>
            ` : '<p>Données de livraison manquantes</p>'}
          </div>
        </div>

        <h3 style="color: #1e3a5f; margin-bottom: 15px;">🛠️ Détails de Production</h3>
        ${itemsRows}

        <div style="background-color: #fff7ed; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center;">
          <h3 style="color: #9a3412; margin-top: 0;">🔗 QR Codes pour Impression (1000x1000)</h3>
          <p>Scannez ou téléchargez les QR codes ci-dessous pour la gravure :</p>
          
          ${items.map(item => {
    // Find access code if stored in personalization or items
    const accessCode = item.personalization?.access_code || 'CODE-ERREUR';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&format=png&data=${encodeURIComponent(`https://memorialis.shop/qr/${accessCode}`)}`;

    return `
              <div style="margin: 20px 0;">
                <p><strong>QR Code pour : ${item.personalization?.deceased_name || 'Mémorial'}</strong></p>
                <img src="${qrUrl}" style="width: 250px; height: 250px; border: 1px solid #000;" />
                <p><small>${accessCode}</small></p>
                <p><a href="${qrUrl}" target="_blank" style="color: #2563eb;">Télécharger QR Haute Résolution (1000px)</a></p>
              </div>
            `;
  }).join('')}
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666;">
          <p>Total de la commande : <strong>${formatPrice(total)}</strong></p>
          <p>Date : ${new Date().toLocaleString('fr-FR')}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Production Memorialis <production@memorialis.shop>',
        to: ['contact@memorialis.shop', 'strdu43@gmail.com'],
        subject: `🚨 PRODUCTION : Nouvelle commande #${orderNumber} - ${customerName}`,
        html: adminHtml,
      }),
    });

    const data = await res.json();
    console.log('✅ Admin Notification sent:', data);
    return data;
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
};
