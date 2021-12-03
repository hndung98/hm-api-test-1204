import { Params } from "../../../common/types/params.type";
import { SkipTakePagination } from "../.general/find.params";
export const GetRateWorkPlace: Params = {
    id: {
        required: true,
        type: "number",
        in: 'query'
    },
    starRate: {
        enum: ['1', '2', '3', '4', '5'],
        in: 'query'
    },
    isMy: {
        type: "boolean",
        in: 'query'
    },
    ...SkipTakePagination
};
