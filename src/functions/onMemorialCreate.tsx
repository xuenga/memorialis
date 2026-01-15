import syncToSupabase from './syncToSupabase';

interface TriggerEvent {
  record: any;
}

export default async function onMemorialCreate(event: TriggerEvent, context: any) {
  const memorial = event.record;
  await syncToSupabase({
    entityName: 'Memorial',
    record: memorial,
    operation: 'create'
  });
}

export const config = {
  trigger: {
    entity: 'Memorial',
    operation: 'create'
  }
};
