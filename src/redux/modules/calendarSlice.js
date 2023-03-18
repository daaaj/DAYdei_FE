import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../utils/api/axios";

const initialState = {
  data: [],
  total: [],
  today: [],
  isError: false,
  isLoading: false,
};

export const __getTargetList = createAsyncThunk("getTargetList", async (payload, thunkAPI) => {
  try {
    const response = await api.get(`/api/friends/find/${payload.target}`, {
      headers: {
        Authorization: payload.token,
      },
    });
    return thunkAPI.fulfillWithValue(response.data.data);
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const __createNewPost = createAsyncThunk("createNewPost", async (payload, thunkAPI) => {
  console.log("create slice payload : ", payload);
  try {
    const response = await api.post(`/api/posts`, payload.newPost, {
      headers: {
        Authorization: payload.token,
        "Content-Type": "multipart/form-data",
      },
    });
    return thunkAPI.fulfillWithValue(response.data.data);
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

// 타 유저 프로필
export const __getOtherUser = createAsyncThunk("getOtherUser", async (payload, thunkAPI) => {
  try {
    const response = await api.get(`/api/home/profile/${payload.userId}`, {
      headers: {
        Authorization: payload.token,
      },
    });
    return thunkAPI.fulfillWithValue(response.data.data);
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

// 메인 캘린더 전체 일정 get
export const __getTotalPosts = createAsyncThunk("getTotalPosts", async (payload, thunkAPI) => {
  try {
    const response = await api.get(`/api/home/posts/${payload.userId}`, {
      headers: {
        Authorization: payload.token,
      },
    });
    //console.log("response : ", response.data);
    return thunkAPI.fulfillWithValue(response.data.data);
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

// sidebar 오늘의 일정 get
export const __getTodaySchedule = createAsyncThunk("getTodaySchedule", async (payload, thunkAPI) => {
  try {
    const response = await api.get(`/api/home/today`, {
      headers: {
        Authorization: payload,
      },
    });
    console.log("response today: ", response.data);
    return thunkAPI.fulfillWithValue(response.data.data);
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(__getTargetList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(__getTargetList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.data = action.payload;
      })
      .addCase(__getTargetList.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
    builder
      .addCase(__createNewPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(__createNewPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.data = action.payload;
      })
      .addCase(__createNewPost.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
    builder
      .addCase(__getOtherUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(__getOtherUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.data = action.payload;
      })
      .addCase(__getOtherUser.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
    builder
      .addCase(__getTotalPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(__getTotalPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.total = action.payload;
      })
      .addCase(__getTotalPosts.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
    builder
      .addCase(__getTodaySchedule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(__getTodaySchedule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.today = action.payload;
      })
      .addCase(__getTodaySchedule.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export default calendarSlice.reducer;
