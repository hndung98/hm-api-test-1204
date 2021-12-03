import { Gender } from ".prisma/client";
import { Params } from "../../../common/types/params.type";
import { ACCOUNT_TYPE } from "../../../services/user.service";

export const RegisterDoctor: Params = {
    registerType: {
        required: true,
        enum: Object.values(ACCOUNT_TYPE)
    },
    email: {
        regex: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        type: 'string'
    },
    firstName: {
        required: true
    },
    lastName: {
        required: true
    },
    birthday: {
        required: true,
        type: "string"
    },
    gender: {
        type: 'string',
        in: 'body',
        enum: Object.values(Gender),
    },
    password: {
        type: "string"
    },
    phoneNumber: {
        type: 'string'
    },
    avatar: {
        in: 'body',
        type: 'file',
        required: true
    },
    address: {
        type: 'string'
    },
    specializedId: {
        required: true,
        type: 'number'
    },
    identityCardNumber: {
        required: true,
        type: 'string'
    },
    identityCard: {
        in: "body",
        type: "array",
        items: {
            type: "file",
        },
    },
    practicingCertificate: {
        in: "body",
        type: "array",
        items: {
            type: "file",
        },
    },
    otherImages: {
        in: "body",
        type: "array",
        items: {
            type: "file",
        },
    },
    code: {
        required: true
    },
};
