import { Params } from "../../../common/types/params.type";

export const DoctorUpdateMedicalRecord: Params = {
    id: {
        in: 'path',
        required: true,
        type: 'number'
    },
    diagnostic: {
        in: 'body',
        type: 'array',
        items: {
            type: 'string'
        }
    },
    medicalExpense: {
        in: 'body',
        type: 'number'
    },
    note: {
        in: 'body'
    },
    height: {
        in: 'body'
    },
    weight: {
        in: 'body'
    },
    bodyTemperature: {
        in: 'body'
    },
    bloodPressure: {
        in: 'body'
    },
    heartBeat: {
        in: 'body'
    },
    bloodGroup: {
        in: 'body'
    },
    files: {
        in: "body",
        type: "array",
        items: {
            type: "file",
        },
    },
};
