import { Params } from "../../../common/types/params.type";

export const DoctorUpdateMedicalRecord: Params = {
    diagnostic: {
        in: 'body',
        type: 'array',
        items: {
            type: "string",
        }
    },
    medicalExpense: {
        type: "number"
    },
    note: {
        type: "string"
    }
};
