import { Params } from "../../../common/types/params.type";

export const AutoDeployWebHook: Params = {
  env: {
    in: "query",
    required: true,
  },
  secret: {
    in: "query",
    required: true,
  },
};
