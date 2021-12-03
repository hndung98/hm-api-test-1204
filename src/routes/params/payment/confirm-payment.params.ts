import { Params } from "../../../common/types/params.type";

export const ConfirmPayment: Params = {
    vnp_Amount: {
        type: 'string',
        required: true,
        in: 'query'
    },
    vnp_BankCode: {
        type: 'string',
        required: true,
        in: 'query'
    },
    vnp_BankTranNo: {
        type: 'string',
        required: true,
        in: 'query'
    },
    vnp_CardType: {
        type: 'string',
        required: true,
        in: 'query'
    },
    vnp_OrderInfo: {
        type: 'string',
        required: true,
        in: 'query'
    },
    vnp_PayDate: {
        type: 'string',
        required: true,
        in: 'query'
    },
    vnp_ResponseCode: {
        type: 'string',
        required: true,
        in: 'query'
    },
    vnp_TmnCode: {
        type: 'string',
        required: true,
        in: 'query'
    },
    vnp_TransactionNo: {
        type: 'string',
        required: true,
        in: 'query'
    },
    vnp_TransactionStatus: {
        type: 'string',
        required: true,
        in: 'query'
    },
    vnp_TxnRef: {
        type: 'string',
        required: true,
        in: 'query'
    },
    vnp_SecureHash: {
        type: 'string',
        required: true,
        in: 'query'
    },
};
