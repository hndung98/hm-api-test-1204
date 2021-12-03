import { Gender } from ".prisma/client";
import { Params } from "../../../common/types/params.type";
import { ACCOUNT_TYPE } from "../../../services/user.service";

export const RegisterCustomer: Params = {
    registerType: {
        required: true,
        enum: Object.values(ACCOUNT_TYPE)
    },
    email: {
        regex: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        type: 'string'
    },
    password: {
        type: 'string'
    },
    phoneNumber: {
        type: 'string'
    },
    firstName: {
        required: true
    },
    lastName: {
        required: true
    },
    gender: {
        type: 'string',
        in: 'body',
        enum: Object.values(Gender),
    },
    code: {
        required: true
    },


};
