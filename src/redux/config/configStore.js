import { configureStore } from "@reduxjs/toolkit";
import users from "../modules/usersSlice";
import kakao from "../modules/kakaoSlice";
import friends from "../modules/friendsSlice";
import calendar from "../modules/calendarSlice";
import subscribe from "../modules/subscribeSlice";
import connect from "../modules/connectSlice";
import memos from "../modules/memosSlice";
import header from "../modules/headerReducer";

const store = configureStore({
  reducer: {
    users,
    kakao,
    friends,
    calendar,
    subscribe,
    connect,
    memos,
    header,
  },
});

export default store;
