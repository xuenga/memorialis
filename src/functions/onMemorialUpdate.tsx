import syncToSupabase from './syncToSupabase';

interface TriggerEvent {
  record: any;
}

export default async function onMemorialUpdate(event: TriggerEvent, context: any) {
  const memorial = event.record;
  await syncToSupabase({
    entityName: 'Memorial',
    record: memorial,
    operation: 'update'
  });
}

export const config = {
  trigger: {
    entity: 'Memorial',
    operation: 'update'
  }
};
