import { Params } from "../../../common/types/params.type";
import { VERIFY_TYPE } from "./delete-guardian-verify.params";

export const CreateUserGuardianVerify: Params = {
    password: {
        required: true,
    },
    guardiantId: {
        type: "number",
        required: true
    },
    type: {
        required: true,
        enum: Object.values(VERIFY_TYPE)
    },
    email: {
        type: 'string'
    },
    phoneNumber: {
        type: 'string'
    }
};
