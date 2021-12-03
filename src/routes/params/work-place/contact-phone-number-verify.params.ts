import { Params } from "../../../common/types/params.type";
export const AddContactPhoneNumberVerify: Params = {
    id: {
        required: true,
        type: "number"
    },
    password: {
        required: true,
    },
    phoneNumber: {
        required: true
    }
}