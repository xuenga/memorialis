const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://qjtzpbpvjiicddkmqfim.supabase.co', 'sb_publishable_RzQ_g8_oJbdGhcuga7T1aQ_We17LJlU');
async function test() {
  const { error } = await supabase.rpc('execute_sql_hack', { sql: 
CREATE OR REPLACE FUNCTION public.activate_memorial(code_input text, email_input text DEFAULT NULL)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  qr_record RECORD;
  new_memorial_id text;
BEGIN
  IF code_input ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    SELECT * INTO qr_record FROM "QRCode" WHERE id = code_input::uuid;
  ELSE
    SELECT * INTO qr_record FROM "QRCode" WHERE code = code_input;
  END IF;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Code introuvable');
  END IF;

  IF qr_record.status = 'activated' THEN
     RETURN json_build_object('success', true, 'message', 'Déjà activé', 'memorial_id', qr_record.memorial_id);
  END IF;

  IF qr_record.status NOT IN ('reserved', 'available') THEN
    RETURN json_build_object('success', false, 'message', 'Ce code n''est pas prêt à être activé (' || qr_record.status || ')');
  END IF;

  IF qr_record.status = 'available' THEN
    INSERT INTO "Memorial" (name, access_code, owner_email, is_activated, is_public, require_moderation, allow_comments, created_date)
    VALUES ('Mon Mémorial', qr_record.code, email_input, true, false, true, true, now())
    RETURNING id INTO new_memorial_id;
    
    UPDATE "QRCode"
    SET status = 'activated', activated_at = now(), memorial_id = new_memorial_id, owner_email = email_input
    WHERE id = qr_record.id;
    
    RETURN json_build_object('success', true, 'memorial_id', new_memorial_id);
  END IF;

  UPDATE "QRCode"
  SET status = 'activated', activated_at = now()
  WHERE id = qr_record.id;

  IF qr_record.memorial_id IS NOT NULL THEN
    UPDATE "Memorial"
    SET is_activated = true
    WHERE id = qr_record.memorial_id;
  END IF;

  RETURN json_build_object('success', true, 'memorial_id', qr_record.memorial_id);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$function$;
   });
  console.log('Error creating SQL:', error);
}
test();
