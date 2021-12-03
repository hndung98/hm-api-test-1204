import { Params } from "../../../common/types/params.type";

export const DeleteListSpecialized: Params = {
    ids: {
        required: true,
        type: 'array',
        items: {
            type: 'number'
        },
        in: "query"
    },
};
