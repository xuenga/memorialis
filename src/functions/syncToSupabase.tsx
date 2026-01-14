import { supabase } from '@/lib/supabaseClient';

interface SyncOptions {
    entityName: string;
    record: any;
    operation: 'create' | 'update' | 'delete';
}

export default async function syncToSupabase({ entityName, record, operation }: SyncOptions) {
    // Map entity names to table names if strictly necessary, 
    // otherwise assume table names match entity names (e.g., 'Memorial', 'Order')
    // It is recommended to use lowercase table names in Supabase (Postgres), 
    // so we lowerCase it here.
    const tableName = entityName;

    console.log(`Syncing to Supabase table: ${tableName}, operation: ${operation}`, record);

    try {
        if (operation === 'create' || operation === 'update') {
            // Upsert handles both create and update if ID is provided
            const { data, error } = await supabase
                .from(tableName)
                .upsert(record, { onConflict: 'id' })
                .select();

            if (error) throw error;
            return { success: true, data };
        }

        if (operation === 'delete') {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', record.id);

            if (error) throw error;
            return { success: true };
        }

        return { success: false, error: 'Unknown operation' };

    } catch (error: any) {
        console.error('Supabase sync error:', error);
        return { success: false, error: error.message };
    }
}
