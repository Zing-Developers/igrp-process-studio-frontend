export const getDataTypes = async () => {
  return [
    {
      label: 'String',
      value: 'string',
    },
    {
      label: 'Number',
      value: 'number',
    },
    {
      label: 'Boolean',
      value: 'boolean',
    },
  ];
};

export const getStatusProcessDefinition = () => {
  return [
    {
      label: 'Todos',
      value: 'ALL',
    },
    {
      label: 'Publicado',
      value: 'PUBLISHED',
    },
    {
      label: 'Rascunho',
      value: 'DRAFT',
    },
  ];
};
