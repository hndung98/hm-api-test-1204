import { AppointmentStatus } from ".prisma/client";
import { Params } from "../../../common/types/params.type";

export const DoctorUpdateAppointment: Params = {
    id: {
        in: 'path',
        type: 'number',
        required: true
    },
    status: {
        in: 'body',
        enum: [AppointmentStatus.DOCTOR_CANCEL, AppointmentStatus.DOING, AppointmentStatus.DONE],
        required: true
    },
};
