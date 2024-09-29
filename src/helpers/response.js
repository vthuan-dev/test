import { STATUS } from "../config/status";

export class ErrorHandler extends Error {
  status;
  error;
  constructor(status, error) {
    super();
    this.status = status;
    this.error = error;
  }
}

export const responseError = (res, error) => {
  if (error instanceof ErrorHandler) {
    const status = error.status;
    if (typeof error.error === "string") {
      const message = error.error;
      return res.status(status).send({ isSuccess: false, message, data: null });
    }

    return res.status(status).send({
      message: "Có lỗi sảy ra",
      data: null,
      isSuccess: false,
    });
  }
  return res
    .status(STATUS.INTERNAL_SERVER_ERROR)
    .send({ message: error.message, data: null, isSuccess: false });
};

export const responseSuccess = (res, data) => {
  return res.status(STATUS.OK).send({ isSuccess: true, ...data });
};

export const responseNotFound = (res) => {
  const error = new ErrorHandler(STATUS.NOT_FOUND, "Không tìm thấy");

  return responseError(res, error);
};
