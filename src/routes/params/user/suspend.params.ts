import { Params } from "../../../common/types/params.type";

export const SuspendUser: Params = {
  id: {
    type: "number",
    in: 'path',
    required: true,
  },
  isSuspend: {
    type: 'boolean',
    required: true
  }
};

