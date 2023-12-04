import { THydratedStaffDocument } from "../types/staff/staff_document_type";
import { THydratedUserDocument } from "../types/user/user_document_type";

export const extractUserData = ({
  document,
}: {
  document: THydratedUserDocument;
}) => {
  const { password: pwd, ...data_except_password } = document.toJSON();
  return {
    data_except_password,
  };
};

export const extractStaffData = ({
  document,
}: {
  document: THydratedStaffDocument;
}) => {
  const { password: pwd, ...data_except_password } = document.toJSON();
  return {
    data_except_password,
  };
};
