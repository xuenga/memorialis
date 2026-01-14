import syncToSupabase from './syncToSupabase';

export default async function onMemorialUpdate(event, context) {
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
