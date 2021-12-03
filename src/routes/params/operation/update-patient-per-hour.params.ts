import { Params } from "../../../common/types/params.type";

export const UpdatePatientPerHour: Params = {
    patients: {
        type: 'number',
        required: true
    },
    id: {
        type: 'number',
        required: true
    }
};
