import { Params } from "../../../common/types/params.type";

export const UpdateOperationHour: Params = {
    addList: {
        type: 'array',
        items: {
            type: 'object'
        }
    },
    updateList: {
        type: 'array',
        items: {
            type: 'object'
        }
    },
    deleteList: {
        type: 'array',
        items: {
            type: 'integer'
        }
    },
    id: {
        type: 'number',
        required: true
    }
};
