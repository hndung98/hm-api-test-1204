import { Params } from "../../../common/types/params.type";

export const GetWards: Params = {
    districtId: {
        required: true,
        in: 'path'
    },
};
