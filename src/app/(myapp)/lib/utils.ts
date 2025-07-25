// Convert data to name, value format
export const convertToMapOptions = (items: any[], nameKey = 'name', valueKey = 'id') => {
  return (
    (items !== undefined &&
      items?.map((item) => ({
        label: item[nameKey] || item.title || item.label || item.name,
        value: item[valueKey] || item.uuid || item.key,
      }))) ||
    []
  );
};
