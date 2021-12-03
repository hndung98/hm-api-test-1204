import { Params } from "../../../common/types/params.type";
export const AddContactPhoneNumber: Params = {
    id: {
        required: true,
        type: "number"
    },
    password: {
        required: true,
    },
    phoneNumber: {
        required: true
    },
    code: {
        required: true
    }
}