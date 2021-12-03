import { Params } from "../../../common/types/params.type";

export const GetListDoctor: Params = {
    specializedId: {
        in: 'query',
        type: 'number'
    },
    booked: {
        in: 'query',
        type: 'boolean',
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
