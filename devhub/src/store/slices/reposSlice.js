import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  totalCount: 0,
}

const reposSlice = createSlice({
  name: 'repos',
  initialState,
  reducers: {},
})

export default reposSlice.reducer