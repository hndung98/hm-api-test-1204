import { Params } from "../../../common/types/params.type";
import { ACCOUNT_TYPE } from "../../../services/user.service";

export const CreateUserGuardian: Params = {
    password: {
        required: true,
    },
    guardiantId: {
        type: "number",
        required: true
    },
    type: {
        required: true,
        enum: Object.values(ACCOUNT_TYPE)
    },
    email: {
        type: 'string'
    },
    phoneNumber: {
        type: 'string'
    },
    code: {
        required: true
    },
    guardiantPassword: {
        required: true
    }
};
