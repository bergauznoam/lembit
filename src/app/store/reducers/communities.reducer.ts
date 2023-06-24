import { Action } from "@ngrx/store";
import {
    LoadCommunities,
} from "@state/communities.actions";
import {
    LOAD_COMMUNITIES,
} from '@state/communities.actions.type';
import { StarredCommunity } from "@models/starredCommunity.model";

const initialState: StarredCommunity[] = [];

export const communitiesReducer = (state: StarredCommunity[] = initialState, action: Action): StarredCommunity[] => {
    switch (action.type) {
        case LOAD_COMMUNITIES:
            const { communities } = action as LoadCommunities;
            return [...communities];
        default:
            return state;
    }
}