import syncToSupabase from './syncToSupabase';

export default async function onTributeCreate(event, context) {
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
