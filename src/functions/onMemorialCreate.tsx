import syncToSupabase from './syncToSupabase';

export default async function onMemorialCreate(event, context) {
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
