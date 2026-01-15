import syncToSupabase from './syncToSupabase';

interface TriggerEvent {
  record: any;
}

export default async function onOrderUpdate(event: TriggerEvent, context: any) {
  const order = event.record;
  await syncToSupabase({
    entityName: 'Order',
    record: order,
    operation: 'update'
  });
}

export const config = {
  trigger: {
    entity: 'Order',
    operation: 'update'
  }
};
