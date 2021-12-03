import { Params } from "../../../common/types/params.type";
import { SkipTakePagination } from "../.general/find.params";

export const SortQuestion = {
    NEWEST: "NEWEST",
    OLDEST: "OLDEST",
    MOST_FAVORITE: "MOST_FAVORITE",
    MOST_COMMENTED: "MOST_COMMENTED",
}

export const GetQuestionAnswered: Params = {
    ...SkipTakePagination,
    keyword: {
        in: "query",
        type: "string"
    },
    specializedId: {
        in: "query",
        type: 'number'
    }
};
