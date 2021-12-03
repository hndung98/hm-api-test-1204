import { Params } from "../../../common/types/params.type";

export const CreateJobPosition: Params = {
    title: {
        required: true
    },
    description: {
        type: 'string'
    },
};
