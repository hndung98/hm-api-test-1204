import { Params } from "../../../common/types/params.type";

export const DeleteCustomer: Params = {
  id: {
    type: "number",
    in: 'path',
    required: true,
  },
  isDelete: {
    type: 'boolean',
    required: true
  }
};

