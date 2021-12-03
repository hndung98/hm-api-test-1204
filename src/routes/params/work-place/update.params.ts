import { WorkPlaceStatus } from ".prisma/client";
import { Params } from "../../../common/types/params.type";
export const UpdateWorkplace: Params = {
    id: {
        required: true,
        type: "number"
    },
    status: {
        enum: [WorkPlaceStatus.ACTIVE, WorkPlaceStatus.INACTIVE],
        required: true
    },
    name: {
        required: true
    },
    address: {
        required: true
    }
};
