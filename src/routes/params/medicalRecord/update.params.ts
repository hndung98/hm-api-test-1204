import { MedicalRecordStatus } from ".prisma/client";
import { Params } from "../../../common/types/params.type";

export const UpdateMedicalRecord: Params = {
    id: {
        in: 'path',
        type: 'number',
        required: true
    },
    status: {
        in: 'body',
        enum: Object.values(MedicalRecordStatus),
        required: true
    },
};
