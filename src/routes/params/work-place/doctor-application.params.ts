import { Params } from "../../../common/types/params.type";
export const DoctorApplication: Params = {
    workPlaceId: {
        in: 'path',
        type: 'number',
        required: true
    },
    jobPositionId:{
        type: 'number',
        required: true
    }
};
