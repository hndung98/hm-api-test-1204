import { Params } from "../../../common/types/params.type";

export const UploadImages: Params = {
    images: {
        in: "body",
        type: "array",
        items: {
            type: "file",
        },
    },
};
