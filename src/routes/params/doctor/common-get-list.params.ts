import { Params } from "../../../common/types/params.type";

export const CommonGetListDoctor: Params = {
    specializedId: {
        in: 'query',
        type: 'number'
    },
    skip: {
        in: 'query',
        type: 'number'
    },
    take: {
        in: 'query',
        type: 'number'
    },
    wardId: {
        in: 'query',
        type: 'number'
    },
    districtId: {
        in: 'query',
        type: 'number'
    },
    provinceId: {
        in: 'query',
        type: 'number'
    }
};
