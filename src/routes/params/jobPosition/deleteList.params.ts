import { Params } from "../../../common/types/params.type";

export const DeleteListJobPosition: Params = {
    ids: {
        required: true,
        type: 'array',
        items: {
            type: 'number'
        },
        in: "query"
    },
};
