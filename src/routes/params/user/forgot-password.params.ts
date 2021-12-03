import { Params } from "../../../common/types/params.type";

export const CertificateType = {
  PHONE: 'PHONE',
  EMAIL: 'EMAIL'
}

export const ForgotPassword: Params = {
  newPassword: {
    type: "string",
    required: true,
  },
  code: {
    type: "string",
    required: true,
  },
  type: {
    required: true,
    enum: Object.values(CertificateType)
  },
  email: {
    type: 'string'
  },
  phoneNumber: {
    type: 'string'
  }
};

