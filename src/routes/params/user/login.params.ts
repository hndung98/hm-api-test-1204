import { Params } from "../../../common/types/params.type";

export const Login: Params = {
    username: {
        required: true,
        type: 'string'
    },
    password: {
        required: true
    },
};
