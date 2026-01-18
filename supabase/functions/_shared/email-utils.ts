import { Resend } from 'https://esm.sh/resend@2.0.0';

export const sendConfirmationEmail = async (order: any, memorial: any) => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not set');
    return;
  }

  const resend = new Resend(resendApiKey);

  const customerName = order.customer_name || 'Client';
  const orderNumber = order.order_number;
  const accessCode = memorial?.access_code || 'N/A';
  const memorialId = memorial?.id;
  const editUrl = memorialId ? `https://memorialis.shop/edit-memorial/${memorialId}` : '#';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: sans-serif; color: #2f4858; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #e0bd3e; font-size: 24px; font-weight: bold; font-family: serif; }
        .card { background: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #eee; }
        .code { font-family: monospace; font-size: 24px; letter-spacing: 2px; color: #e0bd3e; font-weight: bold; display: block; margin: 10px 0; }
        .btn { display: inline-block; background-color: #e0bd3e; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; }
        .footer { font-size: 12px; color: #888; text-align: center; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Memorialis</div>
        </div>
        
        <h2>Merci pour votre commande, ${customerName} !</h2>
        <p>Nous avons bien reçu votre commande <strong>#${orderNumber}</strong>.</p>
        
        <div class="card">
          <h3>Votre Mémorial est prêt</h3>
          <p>Vous pouvez dès maintenant commencer à personnaliser le mémorial de votre proche.</p>
          
          <p>Voici votre code d'accès unique :</p>
          <span class="code">${accessCode}</span>
          
          <p>Conservez ce code précieusement. Il vous sera demandé pour modifier le mémorial si vous changez d'appareil.</p>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${editUrl}" class="btn">Personnaliser le mémorial</a>
          </div>
        </div>

        <p>Si vous avez commandé une plaque physique, vous recevrez un autre email lors de son expédition.</p>
        
        <div class="footer">
          <p>Besoin d'aide ? Répondez simplement à cet email.</p>
          <p>© ${new Date().getFullYear()} Memorialis. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: 'Memorialis <commandes@memorialis.shop>', // Update this to your verified domain
      to: [order.customer_email],
      subject: `Confirmation de votre commande ${orderNumber} - Memorialis`,
      html: htmlContent,
    });

    console.log('Confirmation email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return null; // Return null so we don't crash the calling function
  }
};
