
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { sendOrderConfirmationEmail } from '../_shared/email.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        console.error('Missing stripe-signature header')
        return new Response('No signature', { status: 400 })
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey || !webhookSecret) {
        console.error('Missing Stripe configuration')
        return new Response('Missing Stripe configuration', { status: 500 })
    }

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase configuration')
        return new Response('Missing Supabase configuration', { status: 500 })
    }

    const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
        httpClient: Stripe.createFetchHttpClient(),
    })

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    try {
        const body = await req.text()
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

        console.log(`Received Stripe event: ${event.type}`)

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session

            console.log('Processing checkout session:', session.id)

            const metadata = session.metadata || {}
            const items = JSON.parse(metadata.items || '[]')
            const customerName = metadata.customer_name || 'Client'
            const customerEmail = session.customer_email || ''
            const shippingAddress = metadata.shipping_address ? JSON.parse(metadata.shipping_address) : null

            // Generate order number
            const orderNumber = `MEM-${Date.now().toString(36).toUpperCase()}`

            console.log('Creating order:', orderNumber)

            // 1. Find an available QR code for each item purchased
            let qrCode = null
            let accessCode = ''
            let memorialId = null
            let memorial = null;

            // Check if we need a QR code (for memorial products)
            // Relaxed check: If there are items, we assume it's a memorial product
            const needsQRCode = items.length > 0;

            console.log('Webhook: Checking needsQRCode', needsQRCode);

            // 1. Create or get user account
            let userId = null;
            let invitationLink = '';

            try {
                // Check if user already exists
                const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

                const existingUser = existingUsers?.users?.find((u: any) => u.email === customerEmail);

                if (existingUser) {
                    // User already exists, use their ID
                    userId = existingUser.id;
                    console.log('User already exists:', customerEmail);
                } else {
                    // Create new user account
                    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
                        email: customerEmail,
                        email_confirm: true, // Auto-confirm email
                        user_metadata: {
                            full_name: customerName,
                            role: 'customer'
                        }
                    });

                    if (createUserError) {
                        console.error('Error creating user:', createUserError);
                    } else if (newUser?.user) {
                        userId = newUser.user.id;
                        console.log('New user created:', userId);

                        // Generate invitation link for password setup
                        const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://memorialis.shop';
                        const { data: inviteData, error: inviteError } = await supabase.auth.admin.generateLink({
                            type: 'invite',
                            email: customerEmail,
                            options: {
                                redirectTo: `${frontendUrl}/set-password`
                            }
                        });

                        if (inviteError) {
                            console.error('Error generating invitation link:', inviteError);
                        } else if (inviteData?.properties?.action_link) {
                            invitationLink = inviteData.properties.action_link;
                            console.log('Invitation link generated');
                        }
                    }
                }
            } catch (userError) {
                console.error('Error in user creation process:', userError);
            }

            if (needsQRCode) {
                const { data: qrCodes, error: qrError } = await supabase
                    .from('QRCode')
                    .select('*')
                    .eq('status', 'available')
                    .limit(1)

                if (qrError) {
                    console.error('Error fetching QR code:', qrError)
                }

                qrCode = qrCodes && qrCodes.length > 0 ? qrCodes[0] : null
                accessCode = qrCode?.code || Math.random().toString(36).substring(2, 8).toUpperCase()

                // 2. Create the memorial with user_id
                const deceasedName = items[0]?.personalization?.deceased_name ||
                    items[0]?.personalization?.defunt_name ||
                    'Mémorial'

                const { data: createdMemorial, error: memError } = await supabase
                    .from('Memorial')
                    .insert({
                        id: crypto.randomUUID(),
                        name: deceasedName,
                        access_code: accessCode,
                        owner_email: customerEmail,
                        user_id: userId, // Link to the created user
                        is_activated: false,
                        theme: 'classic',
                        birth_date: items[0]?.personalization?.birth_date || null,
                        death_date: items[0]?.personalization?.death_date || null,
                    })
                    .select()
                    .single()

                if (memError) {
                    console.error('Error creating memorial:', memError)
                } else {
                    memorial = createdMemorial;
                    memorialId = createdMemorial.id
                    console.log('Memorial created:', createdMemorial.id)
                }
            }

            // 3. Create the order
            const { data: order, error: orderError } = await supabase
                .from('Order')
                .insert({
                    order_number: orderNumber,
                    customer_email: customerEmail,
                    customer_name: customerName,
                    customer_phone: metadata.customer_phone || null,
                    shipping_address: shippingAddress,
                    items: items,
                    subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
                    shipping_cost: 0, // Free shipping
                    total: session.amount_total ? session.amount_total / 100 : 0,
                    status: 'paid',
                    memorial_id: memorialId,
                    stripe_payment_id: session.payment_intent as string,
                })
                .select()
                .single()

            if (orderError) {
                console.error('Error creating order:', orderError)
                throw orderError
            }

            console.log('Order created:', order.id)

            // 4. Update QR code status if found
            if (qrCode && memorialId) {
                const { error: updateError } = await supabase
                    .from('QRCode')
                    .update({
                        status: 'reserved',
                        memorial_id: memorialId,
                        order_id: order.id,
                        owner_email: customerEmail,
                        reserved_at: new Date().toISOString(),
                    })
                    .eq('id', qrCode.id)

                if (updateError) {
                    console.error('Error updating QR code:', updateError)
                } else {
                    console.log('QR code reserved:', qrCode.code)
                }
            }

            console.log(`✅ Order ${orderNumber} processed successfully`)

            // Send Confirmation Email
            try {
                // Construct logic url (assumes frontend is at origin of valid domain or localhost)
                const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://memorialis.shop';
                const memorialLink = memorial ? `${frontendUrl}/edit-memorial/${accessCode}` : `${frontendUrl}/edit-memorial/${accessCode}`;

                await sendOrderConfirmationEmail(
                    customerEmail,
                    customerName,
                    orderNumber,
                    accessCode,
                    memorialLink,
                    items,
                    session.amount_subtotal ? session.amount_subtotal / 100 : 0,
                    0, // Free shipping
                    session.amount_total ? session.amount_total / 100 : 0,
                    shippingAddress,
                    invitationLink // Pass the invitation link for password setup
                );
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
            }
        }

        return new Response(
            JSON.stringify({ received: true }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (err) {
        console.error('Webhook processing failed:', err.message)
        return new Response(
            JSON.stringify({ error: err.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
