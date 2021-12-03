import { Params } from "../../../common/types/params.type";

export const UpdateMedicalExpense: Params = {
    medicalExpense: {
        type: 'number',
        required: true
    },
    id: {
        type: 'number',
        required: true
    }
};
