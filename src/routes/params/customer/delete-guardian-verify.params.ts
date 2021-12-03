import { Params } from "../../../common/types/params.type";

export const VERIFY_TYPE = {
    EMAIL: "EMAIL",
    PHONE: "PHONE"
}

export const DeleteGuardianVerify: Params = {
    id: {
        type: "number",
        required: true,
    },
    type: {
        required: true,
        enum: Object.values(VERIFY_TYPE)
    }
};
