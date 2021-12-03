import { Params } from "../../../common/types/params.type";
import { SkipTakePagination } from "../.general/find.params";

export const SortQuestion = {
    NEWEST: "NEWEST",
    OLDEST: "OLDEST",
    MOST_FAVORITE: "MOST_FAVORITE",
    MOST_COMMENTED: "MOST_COMMENTED",
}

export const GetQuestion: Params = {
    ...SkipTakePagination,
    keyword: {
        in: "query",
        type: "string"
    },
    sortBy: {
        in: "query",
        enum: Object.values(SortQuestion)
    },
    specializedId: {
        in: "query",
        type: 'number'
    }
};
