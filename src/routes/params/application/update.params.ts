import { Params } from "../../../common/types/params.type";

export const UpdateApplication: Params = {
    id: {
        in: 'path',
        type: 'number',
        required: true
    },
    isAccept: {
        type: 'boolean',
        required: true
    },
};
