import { Gender } from ".prisma/client";
import { Params } from "../../../common/types/params.type";

export const UpdateProfileCustomer: Params = {
    firstName: {
        type: 'string',
        in: 'body',
        required: true
    },
    lastName: {
        type: 'string',
        in: 'body',
        required: true
    },
    gender: {
        type: 'string',
        in: 'body',
        enum: Object.values(Gender),
        required: true
    },
    birthday: {
        type: 'string',
        required: true,
    },
    avatar: {
        in: 'body',
        type: 'file'
    },
    phoneNumber: {
        in: 'body',
        regex: /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/
    },
    provinceId: {
        in: 'body',
        type: 'number'
    },
    address: {
        in: 'body',
        type: 'string'
    }
};
