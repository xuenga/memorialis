import syncToSupabase from './syncToSupabase';

export default async function onCartItemCreate(event, context) {
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
