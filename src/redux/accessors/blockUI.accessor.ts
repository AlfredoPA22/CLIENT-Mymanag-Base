import { RootState } from '../store';

export const getBlockUI = (state: RootState) => state.blockUISlice;
export const getIsBlocked = (state: RootState) => getBlockUI(state).isBlocked;
