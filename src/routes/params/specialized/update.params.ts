import { Gender } from ".prisma/client";
import { Params } from "../../../common/types/params.type";

export const UpdateSpecialized: Params = {
    id: {
        required: true,
        type: 'number',
        in: 'path'
    },
    name: {
        required: true,
        type: 'string'
    },
};
