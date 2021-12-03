import { Params } from "../../common/types/params.type";

export const PendingApplicationForm: Params = {
    applicationId: {
        required: true,
        type: 'number'
    }
};
