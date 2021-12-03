import { WorkPlaceStatus } from ".prisma/client";
import { Params } from "../../../common/types/params.type";
import { SkipTakePagination } from "../.general/find.params"
export const GetWorkPlace: Params = {
    ...SkipTakePagination,
    keyword: {
        in: 'query'
    },
    status: {
        enum: Object.values(WorkPlaceStatus),
        in: 'query'
    },
};
