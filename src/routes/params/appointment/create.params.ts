import { Params } from "../../../common/types/params.type";

export const CreateAppointment: Params = {
    guardianId: {
        type: 'number'
    },
    doctorId: {
        type: 'number',
        required: true
    },
    dayTime: {
        type: 'string',
        required: true
    },
    description: {
        type: 'array',
        items: {
            type: 'string'
        }
    },
    images: {
        type: 'array',
        items: {
            type: 'file'
        }
    },
    customerIp: {
        type: 'string',
        required: true
    }
};
