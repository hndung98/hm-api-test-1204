import { Params } from "../../../common/types/params.type";
import { SkipTakePagination } from "../.general/find.params";

export const DoctorGetMedicalRecordList: Params = {
    ...SkipTakePagination,
    id: {
        in: 'query',
        type: 'number',
        required: true
    },
};
