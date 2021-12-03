import { AppointmentStatus, MedicalRecordStatus } from ".prisma/client";
import { Params } from "../../../common/types/params.type";
import { SkipTakePagination } from "../.general/find.params";

export const GetMedicalRecordList: Params = {
    ...SkipTakePagination,
    medicalRecordStatus: {
        in: 'query',
        enum: Object.values(MedicalRecordStatus)
    },
    appointmentStatus: {
        in: 'query',
        enum: Object.values(AppointmentStatus)
    },
    customerId: {
        in: 'query',
        type: 'number'
    }
};
