import syncToSupabase from './syncToSupabase';

interface TriggerEvent {
  record: any;
}

export default async function onTributeCreate(event: TriggerEvent, context: any) {
  const tribute = event.record;
  await syncToSupabase({
    entityName: 'Tribute',
    record: tribute,
    operation: 'create'
  });
}

export const config = {
  trigger: {
    entity: 'Tribute',
    operation: 'create'
  }
};
