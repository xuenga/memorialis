import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Deno type declaration for Edge Functions
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const CONTACT_EMAIL = 'contact@memorialis.shop';

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { name, email, subject, message }: ContactFormData = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Email HTML template
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
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">📩 Nouveau Message - Memorialis</h1>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px 20px;">
            
            <!-- Contact Info Box -->
            <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 2px solid #60a5fa; padding: 20px; border-radius: 12px; margin: 0 0 25px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 16px;">👤 Informations du contact</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;"><strong>Nom :</strong></td>
                  <td style="padding: 8px 0; color: #1e3a5f; font-size: 14px;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Email :</strong></td>
                  <td style="padding: 8px 0; color: #1e3a5f; font-size: 14px;">
                    <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Sujet :</strong></td>
                  <td style="padding: 8px 0; color: #1e3a5f; font-size: 14px;">${subject || 'Non spécifié'}</td>
                </tr>
              </table>
            </div>

            <!-- Message Box -->
            <div style="background-color: #f3f4f6; border-left: 4px solid #1e3a5f; padding: 20px; border-radius: 0 8px 8px 0; margin: 0 0 25px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1e3a5f; font-size: 16px;">💬 Message</h3>
              <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">${message}</p>
            </div>

            <!-- Reply Button -->
            <div style="text-align: center; margin: 25px 0;">
              <a href="mailto:${email}?subject=Re: ${subject || 'Votre message sur Memorialis'}" 
                 style="background: linear-gradient(135deg, #1e3a5f 0%, #2f4858 100%); color: white; padding: 14px 28px; 
                        text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px; 
                        box-shadow: 0 4px 6px rgba(30, 58, 95, 0.3);">
                ✉️ Répondre à ${name}
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background-color: #1e3a5f; padding: 20px; text-align: center;">
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
              Ce message a été envoyé depuis le formulaire de contact de memorialis.shop<br>
              © ${new Date().getFullYear()} Memorialis - Tous droits réservés
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Memorialis Contact <contact@memorialis.shop>',
        to: CONTACT_EMAIL,
        reply_to: email,
        subject: `[Contact] ${subject || 'Nouveau message'} - ${name}`,
        html: html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', data);
      return new Response(
        JSON.stringify({ error: data.message || 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Contact email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in send-contact-email:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
