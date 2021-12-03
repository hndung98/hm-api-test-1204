import { Params } from "../../../common/types/params.type";

export const CheckSessionToken: Params = {
  token: {
    type: "string",
    required: true,
  },
};

