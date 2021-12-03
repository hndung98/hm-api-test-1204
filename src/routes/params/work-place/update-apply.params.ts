import { OperationStatus } from ".prisma/client";
import { Params } from "../../../common/types/params.type";
export const UpdateApply: Params = {
    operationId: {
        required: true,
        type: "number"
    },
    status: {
        enum: Object.values(OperationStatus),
        required: true
    }
};
