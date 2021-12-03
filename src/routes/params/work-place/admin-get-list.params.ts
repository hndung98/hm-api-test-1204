import { WorkPlaceStatus, WorkPlaceType } from ".prisma/client";
import { Params } from "../../../common/types/params.type";
import { SkipTakePagination } from "../.general/find.params"
export const AdminGetWorkPlace: Params = {
    ...SkipTakePagination,
    keyword: {
        in: 'query'
    },
    status: {
        enum: Object.values(WorkPlaceStatus),
        in: 'query'
    },
    type: {
        enum: Object.values(WorkPlaceType),
        in: 'query'
    }
};
