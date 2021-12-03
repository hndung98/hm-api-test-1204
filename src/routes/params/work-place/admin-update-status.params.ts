import { WorkPlaceStatus } from ".prisma/client";
import { Params } from "../../../common/types/params.type";
export const AdminUpdateWorkplaceStatus: Params = {
    id: {
        required: true,
        type: "number"
    },
    status: {
        enum: Object.values(WorkPlaceStatus),
        required: true
    },
};
