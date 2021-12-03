import { WorkPlaceStatus, WorkPlaceType } from ".prisma/client";
import { Params } from "../../../common/types/params.type";
export const AdminUpdateWorkplaceInfomation: Params = {
    id: {
        required: true,
        type: "number"
    },
    name: {
        required: true
    },
    contactPhoneNumber: {
        in: "body"
    },
    address: {
        required: true
    },
    status: {
        enum: Object.values(WorkPlaceStatus),
        required: true
    },
    type: {
        enum: Object.values(WorkPlaceType),
        required: true
    },
};
