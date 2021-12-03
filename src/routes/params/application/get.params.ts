import { ApplicationStatus } from ".prisma/client";
import { Params } from "../../../common/types/params.type";

export const GetApplication: Params = {
    status: {
        in:'query',
        enum:  Object.values(ApplicationStatus),
    },
};
