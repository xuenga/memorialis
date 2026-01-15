import syncToSupabase from './syncToSupabase';

interface TriggerEvent {
  record: any;
}

export default async function onOrderCreate(event: TriggerEvent, context: any) {
  const order = event.record;
  await syncToSupabase({
    entityName: 'Order',
    record: order,
    operation: 'create'
  });
}

export const config = {
  trigger: {
    entity: 'Order',
    operation: 'create'
  }
};
