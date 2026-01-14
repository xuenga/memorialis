import syncToSupabase from './syncToSupabase';

export default async function onOrderCreate(event, context) {
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
