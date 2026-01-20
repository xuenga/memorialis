// Deno type declaration for Edge Functions
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

export const sendOrderConfirmationEmail = async (
  email: string,
  customerName: string,
  orderNumber: string,
  accessCode: string,
  memorialLink: string
) => {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return;
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2f4858;">Merci pour votre commande !</h1>
      <p>Bonjour ${customerName},</p>
      <p>Nous avons bien reçu votre commande <strong>#${orderNumber}</strong>.</p>
      
      <div style="background-color: #fce7f3; border: 1px solid #fbcfe8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #be185d;">Votre mémorial est prêt</h3>
        <p>Vous pouvez commencer à le personnaliser dès maintenant :</p>
        <p><strong>Code d'accès :</strong> ${accessCode}</p>
        <p>
          <a href="${memorialLink}" style="background-color: #be185d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Personnaliser mon mémorial
          </a>
        </p>
      </div>

      <p>Si vous avez des questions, n'hésitez pas à nous répondre directement.</p>
      <p>Cordialement,<br>L'équipe Memorialis</p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Memorialis <onboarding@resend.dev>', // Update this with your verified domain later
        to: email,
        subject: `Confirmation de commande #${orderNumber}`,
        html: html,
      }),
    });

    const data = await res.json();
    console.log('Email sent:', data);
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
