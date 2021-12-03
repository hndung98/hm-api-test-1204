import { Params } from "../../../common/types/params.type";
export const DoctorCreateWorkPlace: Params = {
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
    latitude: {
        type: "number"
    },
    longitude: {
        type: "number"
    }
};
