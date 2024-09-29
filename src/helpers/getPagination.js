export const getPagination = async (model, query) => {
  const isPagination = query?.isPagination
    ? JSON.parse(query?.isPagination)
    : false;

  if (!isPagination)
    return {
      isPagination: false,
    };
  const [record] = await model.totalRecord(query);

  const limit = query?.limit || 10;

  const currentPage = query?.page || 1;

  const totalRecord = record.count;

  const totalPage = Math.ceil(totalRecord / limit);
  return {
    currentPage: parseInt(currentPage),
    totalPage,
    limit: parseInt(limit),
    totalRecord,
    isPagination,
  };
};
