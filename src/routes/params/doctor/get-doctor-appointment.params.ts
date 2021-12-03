import { Params } from "../../../common/types/params.type";

export const GetDoctorAppointment: Params = {
    doctorId: {
        type: "number",
        in: 'query',
        required: true
    },
    date: {
        type: "string",
        in: 'query',
        required: true
    },
};
