import { Role } from ".prisma/client";
import { Params } from "../../../common/types/params.type";

export const GetUsers: Params = {
  role: {
    type: "string",
    required: true,
    enum: Object.values(Role),
    in:'query'
  },
};

