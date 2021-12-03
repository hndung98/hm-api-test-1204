import { OperationStatus } from ".prisma/client";
import { Params } from "../../../common/types/params.type";
import { SkipTakePagination } from "../.general/find.params"
export const GetAppliedList: Params = {
    ...SkipTakePagination,
    workPlaceId: {
        in: 'query',
        required: true,
        type: "number"
    },
    status: {
        in: 'query',
        enum: Object.values(OperationStatus)
    }
};
