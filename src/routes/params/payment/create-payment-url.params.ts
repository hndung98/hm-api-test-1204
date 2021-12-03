import { Params } from "../../../common/types/params.type";

export const CreatePaymentUrl: Params = {
    id: {
        type: 'number',
        required: true,
    },
    customerIp: {
        type: 'string',
        required: true
    },
};
