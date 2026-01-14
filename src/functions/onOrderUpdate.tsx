import syncToSupabase from './syncToSupabase';

export default async function onOrderUpdate(event, context) {
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
