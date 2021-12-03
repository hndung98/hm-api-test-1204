import { Params } from "../../../common/types/params.type";

export const LoginSms: Params = {
    phoneNumber: {
        required: true
    },
    code: {
        required: true
    }
};
