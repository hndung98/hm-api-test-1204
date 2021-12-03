import { Params } from "../../../common/types/params.type";
import { SkipTakePagination } from "../.general/find.params";

export const GetListAppointment: Params = {
    ...SkipTakePagination,
};
