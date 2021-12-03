import { Gender } from ".prisma/client";
import { Params } from "../../../common/types/params.type";

export const DeleteSpecialized: Params = {
    id: {
        required: true,
        type: 'number',
        in: 'path'
    },
};
