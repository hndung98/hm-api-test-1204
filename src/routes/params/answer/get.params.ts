import { Params } from "../../../common/types/params.type";
import { SkipTakePagination } from "../.general/find.params";

export const GetAnswerType = {
    NEWEST: 'NEWEST',
    MOST_RELEVANT: 'MOST_RELEVANT'
}

export const GetAnswer: Params = {
    ...SkipTakePagination,
    sortBy: {
        in:'query',
        type: 'string',
        enum: Object.values(GetAnswerType)
    }
};
