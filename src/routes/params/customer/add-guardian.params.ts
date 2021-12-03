import { Gender } from ".prisma/client";
import { Params } from "../../../common/types/params.type";

export const CreateGuardian: Params = {
    guardianName: {
        required: true
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
        required: true
    },
    birthday: {
        required: true
    },
    avatar: {
        in: 'body',
        type: 'file',
    },
    phoneNumber: {
        in: 'body',
        regex: /^[0-9\-\+]{9,15}$/
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
