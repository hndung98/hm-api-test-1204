import { Params } from "../../../common/types/params.type";

export const GetOperation: Params = {
    id: {
        type: 'number',
        in: 'query',
        required: true
    }
};
