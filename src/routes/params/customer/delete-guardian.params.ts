import { Params } from "../../../common/types/params.type";

export const DeleteGuardian: Params = {
    id: {
        type: "number",
        required: true,
        in: 'path'
    },
    code: {
        type: "string",
        required: true
    }
};
