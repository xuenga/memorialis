import { supabase } from '@/lib/supabaseClient';

// Check if Supabase is properly configured
const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

export const api = {
    auth: {
        me: async () => {
            // Keep specific auth logic for now or implement Supabase Auth later
            const user = localStorage.getItem('memorialis_user');
            if (user) return JSON.parse(user);
            throw new Error('Not authenticated');
        },
        login: async (credentials: any) => {
            const user = { id: 'u1', name: 'Admin', role: 'admin', email: credentials.email };
            localStorage.setItem('memorialis_user', JSON.stringify(user));
            return user;
        },
        logout: async () => {
            localStorage.removeItem('memorialis_user');
        }
    },
    entities: new Proxy({}, {
        get: (target, entityName: string) => {
            return {
                get: async (id: string) => {
                    if (!isSupabaseConfigured) {
                        throw new Error('Supabase is not configured');
                    }
                    const { data, error } = await supabase.from(entityName).select('*').eq('id', id).single();
                    if (error) throw error;
                    return data;
                },
                filter: async (params: any) => {
                    if (!isSupabaseConfigured) {
                        throw new Error('Supabase is not configured');
                    }
                    let query = supabase.from(entityName).select('*');
                    if (params) {
                        Object.entries(params).forEach(([key, value]) => {
                            query = query.eq(key, value);
                        });
                    }
                    const { data, error } = await query;
                    if (error) throw error;
                    return data || [];
                },
                list: async (sort?: string) => {
                    if (!isSupabaseConfigured) {
                        throw new Error('Supabase is not configured');
                    }
                    let query = supabase.from(entityName).select('*');
                    // Minimal sort handling
                    // if (sort) ...
                    const { data, error } = await query;
                    if (error) throw error;
                    return data || [];
                },
                create: async (data: any) => {
                    if (!isSupabaseConfigured) {
                        throw new Error('Supabase is not configured');
                    }
                    const { data: created, error } = await supabase.from(entityName).insert(data).select().single();
                    if (error) throw error;
                    return created;
                },
                update: async (id: string, data: any) => {
                    if (!isSupabaseConfigured) {
                        throw new Error('Supabase is not configured');
                    }
                    const { data: updated, error } = await supabase.from(entityName).update(data).eq('id', id).select().single();
                    if (error) throw error;
                    return updated;
                },
                delete: async (idOrFilters: string | any) => {
                    if (!isSupabaseConfigured) {
                        throw new Error('Supabase is not configured');
                    }
                    let query = supabase.from(entityName).delete();
                    if (typeof idOrFilters === 'string') {
                        query = query.eq('id', idOrFilters);
                    } else if (idOrFilters && typeof idOrFilters === 'object') {
                        Object.entries(idOrFilters).forEach(([key, value]) => {
                            query = query.eq(key, value);
                        });
                    }
                    const { error } = await query;
                    if (error) throw error;
                    return { success: true };
                }
            };
        }
    }) as any,
    functions: {
        createStripeCheckout: async (params: any) => {
            console.log('Invoking create-checkout with params:', params);

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const functionUrl = `${supabaseUrl}/functions/v1/create-checkout`;

            console.log('Calling Edge Function URL:', functionUrl);
            console.log('Using Anon Key:', anonKey ? 'Present (length: ' + anonKey.length + ')' : 'MISSING');

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${anonKey}`,
                    'apikey': anonKey
                },
                body: JSON.stringify(params)
            });

            console.log('Edge Function response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Edge Function error response:', errorText);
                throw new Error(`Edge Function failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Edge Function response data:', data);
            return data;
        },
        confirmOrder: async (sessionId: string) => {
            console.log('Invoking confirm-order with session:', sessionId);

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const functionUrl = `${supabaseUrl}/functions/v1/confirm-order`;

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${anonKey}`,
                    'apikey': anonKey
                },
                body: JSON.stringify({ session_id: sessionId })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Edge Function failed: ${response.status} - ${errorText}`);
            }

            return await response.json();
        },
        syncStripeProduct: async (params: { product_id: string; name: string; description?: string; price: number; image_url?: string }) => {
            console.log('Invoking sync-stripe-product with params:', params);

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const functionUrl = `${supabaseUrl}/functions/v1/sync-stripe-product`;

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${anonKey}`,
                    'apikey': anonKey
                },
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Edge Function failed: ${response.status} - ${errorText}`);
            }

            return await response.json();
        }
    },
    storage: {
        upload: async (file: File, folder: string = 'memorials') => {
            const storageName = import.meta.env.VITE_BUNNY_STORAGE_ZONE;
            const apiKey = import.meta.env.VITE_BUNNY_ACCESS_KEY;
            const pullZone = import.meta.env.VITE_BUNNY_PULL_ZONE_URL;

            if (!storageName || !apiKey || !pullZone) {
                console.error('Bunny.net configuration missing:', { storageName: !!storageName, apiKey: !!apiKey, pullZone: !!pullZone });
                throw new Error('Bunny.net storage is not configured');
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            // Construct the path: storage_zone_name/folder/filename
            // Note: Bunny API URL format is https://storage.bunnycdn.com/STORAGE_ZONE_NAME/PATH/FILENAME
            const uploadUrl = `https://storage.bunnycdn.com/${storageName}/${folder}/${fileName}`;

            try {
                const response = await fetch(uploadUrl, {
                    method: 'PUT',
                    headers: {
                        'AccessKey': apiKey,
                        'Content-Type': 'application/octet-stream', // Bunny recommends octet-stream or actual type
                    },
                    body: file,
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Bunny Error Details:', { status: response.status, statusText: response.statusText, body: errorText });
                    throw new Error(`Bunny upload failed: ${response.status} ${response.statusText} - ${errorText}`);
                }

                // Construct public URL
                // Ensure pullZone doesn't have trailing slash and path doesn't have leading slash duplication
                const cleanPullZone = pullZone.replace(/\/$/, '');
                const publicUrl = `${cleanPullZone}/${folder}/${fileName}`;

                return publicUrl;
            } catch (error) {
                console.error('Bunny upload error:', error);
                throw error;
            }
        }
    }
};
