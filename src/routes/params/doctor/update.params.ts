import { Gender } from ".prisma/client";
import { Params } from "../../../common/types/params.type";

export const UpdateDoctorProfile: Params = {
    firstName: {
        in: 'body',
        type: 'string'
    },
    lastName: {
        in: 'body',
        type: 'string'
    },
    birthday: {
        in: 'body',
        type: 'string'
    },
    gender: {
        in: 'body',
        type: 'string',
        enum: Object.values(Gender)
    },
    avatar: {
        in: 'body',
        type: 'file'
    },
    introduce: {
        in: 'body',
        type: 'array',
        items: {
            type: "string"
        }
    },
    provinceId: {
        type: 'number'
    },
    medicalExamination: {
        in: 'body',
        type: 'array',
        items: {
            type: "string"
        }
    },
};
