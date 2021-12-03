import { Params } from "../../../common/types/params.type";

export const CreateAnswer: Params = {
    questionId: {
        required: true,
        type: 'number'
    },
    content: {
        required: true,
        type: 'string'
    },
    specializedId: {
        type: 'number'
    }
};
