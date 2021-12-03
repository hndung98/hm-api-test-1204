import { AppointmentStatus } from ".prisma/client";
import { Params } from "../../../common/types/params.type";

export const Period = {
    DAY: "DAY",
    MONTH: "MONTH",
    YEAR: "YEAR",
}
export const GetCustomerAppointment: Params = {
    status: {
        in: 'query',
        enum: Object.values(AppointmentStatus)
    },
    period: {
        in: 'query',
        enum: Object.values(Period)
    },
    day: {
        in: 'query',
        type: 'number',
    },
    month: {
        in: 'query',
        type: 'number',
    },
    year: {
        in: 'query',
        type: 'number',
    },
};

