import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Types adapted from email.ts
interface OrderItem {
    product_name?: string;
    name?: string;
    quantity: number;
    price: number;
    personalization?: {
        deceased_name?: string;
        defunt_name?: string;
    };
}

interface ShippingAddress {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
}

export default function AdminEmailPreview() {
    const { orderId } = useParams();
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Function to generate HTML (adapted from supabase/functions/_shared/email.ts)
    const generateEmailHtml = (
        customerName: string,
        orderNumber: string,
        accessCode: string,
        items: OrderItem[],
        subtotal: number,
        shippingCost: number,
        total: number,
        shippingAddress?: ShippingAddress | null,
        invitationLink?: string
    ) => {
        const frontendUrl = window.location.origin; // Use current origin for preview
        const memorialLink = `${frontendUrl}/my-memorials`;

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

        return `
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
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&format=png&data=${encodeURIComponent(`${window.location.origin}/qr/${accessCode}`)}" 
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
              <a href="${memorialLink}" style="background: linear-gradient(135deg, #be185d 0%, #9d174d 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(190, 24, 93, 0.3);">
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
    };

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) {
                // Dummy data for preview
                const dummyHtml = generateEmailHtml(
                    'Jean Dupont',
                    'MEM-PREVIEW-1234',
                    'ABCD-1234',
                    [{
                        product_name: 'Plaque Mémorial Standard',
                        quantity: 1,
                        price: 99.00,
                        personalization: { deceased_name: 'Marie Curie' }
                    }],
                    99.00,
                    0,
                    99.00,
                    {
                        street: '123 Rue de la Paix',
                        postal_code: '75000',
                        city: 'Paris',
                        country: 'France'
                    },
                    '#'
                );
                setHtmlContent(dummyHtml);
                setLoading(false);
                return;
            }

            try {
                const orderFn = api.entities.Order;
                const order = await orderFn.get(orderId);

                if (!order) {
                    setError('Commande non trouvée');
                    return;
                }

                // Need memorial info for access code
                let accessCode = 'UNKNOWN';
                if (order.memorial_id) {
                    const memorial = await api.entities.Memorial.get(order.memorial_id);
                    if (memorial) accessCode = memorial.access_code;
                }

                const items = order.items || [];
                // Ensure items match expected format if coming from DB differently
                const formattedItems = items.map((item: any) => ({
                    ...item,
                    price: typeof item.price === 'number' ? item.price : Number(item.price),
                    quantity: typeof item.quantity === 'number' ? item.quantity : Number(item.quantity)
                }));

                const html = generateEmailHtml(
                    order.customer_name || 'Client',
                    order.order_number,
                    accessCode,
                    formattedItems,
                    Number(order.subtotal) || 0,
                    Number(order.shipping_cost) || 0,
                    Number(order.total) || 0,
                    order.shipping_address,
                    '#' // Invitation link not recoverable easily, using placeholder
                );

                setHtmlContent(html);
            } catch (err: any) {
                console.error('Error fetching order:', err);
                setError(err.message || 'Erreur lors du chargement de la commande');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <p className="text-red-500">{error}</p>
                <Button onClick={() => window.location.reload()}>Réessayer</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Aperçu de l'email {orderId ? `(Commande: ${orderId})` : '(Données factices)'}
                    </h1>
                    <Button variant="outline" onClick={() => window.close()}>Fermer</Button>
                </div>
                <div className="overflow-hidden rounded-lg shadow-lg">
                    <iframe
                        title="Email Preview"
                        srcDoc={htmlContent}
                        className="h-[800px] w-full bg-white"
                        style={{ border: 'none' }}
                    />
                </div>
            </div>
        </div>
    );
}
