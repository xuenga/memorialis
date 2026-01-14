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
                delete: async (id: string) => {
                    if (!isSupabaseConfigured) {
                        throw new Error('Supabase is not configured');
                    }
                    const { error } = await supabase.from(entityName).delete().eq('id', id);
                    if (error) throw error;
                    return { id };
                }
            };
        }
    }) as any,
    functions: new Proxy({}, {
        get: (target, funcName: string) => {
            return async (args: any) => {
                console.log(`Executing function: ${funcName}`, args);
                if (funcName === 'createStripeCheckout') {
                    return { url: 'https://checkout.stripe.com/mock' };
                }
                return { success: true };
            };
        }
    }) as any
};
