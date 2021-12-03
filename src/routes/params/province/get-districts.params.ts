import { Params } from "../../../common/types/params.type";

export const GetDistricts: Params = {
    provinceId: {
        required: true,
        in: 'path'
    },
};
