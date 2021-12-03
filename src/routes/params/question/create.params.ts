import { Params } from "../../../common/types/params.type";

export const CreateQuestion: Params = {
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
};
