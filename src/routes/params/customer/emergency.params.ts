import { Params } from "../../../common/types/params.type";

export const UpdateEmergency: Params = {
    phoneNumber: {
        in: 'body',
        regex: /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/,
        required: true
    },
    content: {
        in: 'body',
        required: true
    }
};
