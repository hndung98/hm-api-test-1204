import { Params } from "../../../common/types/params.type";

export const ChangePassword: Params = {
    password: {
        required: true,
        type: 'string'
    },
    newPassword: {
        required: true,
        type: 'string'
    },
};
