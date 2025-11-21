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
      label: 'Publicado',
      value: 'PUBLISHED',
    },
    {
      label: 'Rascunho',
      value: 'DRAFT',
    },
  ];
};
