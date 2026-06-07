import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/personas';

export const getPersonas = createAsyncThunk('personas/getAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const createPersona = createAsyncThunk('personas/create', async (personaData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    // We let axios handle the Content-Type (multipart/form-data) automatically when passing FormData
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL, personaData, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const updatePersona = createAsyncThunk('personas/update', async ({ id, personaData }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${API_URL}/${id}`, personaData, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const initialState = {
  personas: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const personaSlice = createSlice({
  name: 'persona',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPersonas.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPersonas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.personas = action.payload;
      })
      .addCase(getPersonas.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createPersona.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPersona.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.personas.push(action.payload);
      })
      .addCase(createPersona.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updatePersona.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePersona.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Replace the old persona with the updated one
        const index = state.personas.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.personas[index] = action.payload;
        }
      })
      .addCase(updatePersona.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = personaSlice.actions;
export default personaSlice.reducer;
