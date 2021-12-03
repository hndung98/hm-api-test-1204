import { Params } from "../../../common/types/params.type";
export const AddRateWorkPlace: Params = {
    id: {
        required: true,
        type: "number"
    },
    comment: {
        type: "string"
    },
    starRate: {
        required: true,
        enum: ['1', '2', '3', '4', '5']
    }
};
