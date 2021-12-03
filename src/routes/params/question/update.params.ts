import { Params } from "../../../common/types/params.type";

export const UpdateQuestion: Params = {
    title: {
        required: true
    },
    content: {
        required: true
    },
    images: {
        in: "body",
        type: "array",
        items: {
            type: "file",
        },
    },
    deleteImgs: {
        type: 'array',
        items: {
            type: "string"
        }
    }
};
