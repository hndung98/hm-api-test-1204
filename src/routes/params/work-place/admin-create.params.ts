import { WorkPlaceType } from ".prisma/client";
import { Params } from "../../../common/types/params.type";
export const AdminCreateWorkPlace: Params = {
    name: {
        required: true
    },
    wardId: {
        type: 'number',
        required: true
    },
    address: {
        required: true,
    },
    images: {
        type: 'array',
        items: {
            type: 'file'
        }
    },
    type: {
        required: true,
        enum: Object.values(WorkPlaceType)
    },
    latitude: {
        type: "number"
    },
    longitude: {
        type: "number"
    }
};
