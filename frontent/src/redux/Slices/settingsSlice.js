import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api";

// export const createSetting = createAsyncThunk(
//   "settings/createSetting",
//   async (formData, thunkAPI) => {
//     try {
//       const res = await API.post("/api/settings", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       console.log(res.data.data);
//       return res.data.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || "Failed to create setting"
//       );
//     }
//   }
// );

export const saveSetting = createAsyncThunk(
  "settings/saveSetting",
  async (formData, thunkAPI) => {
    try {
      const res = await API.post("/api/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to save setting"
      );
    }
  }
);

export const getSettings = createAsyncThunk(
  "settings/getSettings",
  async (_, thunkAPI) => {
    try {
      const res = await API.get("/api/settings");
      //console.log(res.data.data);
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch settings"
      );
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // .addCase(createSetting.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(createSetting.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.items.push(action.payload);
      // })
      // .addCase(createSetting.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // });

      .addCase(saveSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload];
      })
      .addCase(saveSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload];
      })
      .addCase(getSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default settingsSlice.reducer;
