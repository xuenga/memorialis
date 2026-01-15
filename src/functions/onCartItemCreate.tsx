import syncToSupabase from './syncToSupabase';

interface TriggerEvent {
  record: any;
}

export default async function onCartItemCreate(event: TriggerEvent, context: any) {
  const cartItem = event.record;
  await syncToSupabase({
    entityName: 'CartItem',
    record: cartItem,
    operation: 'create'
  });
}

export const config = {
  trigger: {
    entity: 'CartItem',
    operation: 'create'
  }
};
