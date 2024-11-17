import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from "../store/slice/authSlice";

describe("authSlice", () => {
  const initialState = {
    isLoading: false,
    error: null,
    user: null,
    token: null,
  };

  it("should return the initial state", () => {
    const result = authReducer(undefined, { type: "" });
    expect(result).toEqual(initialState);
  });

  it("should handle loginStart", () => {
    const state = authReducer(initialState, loginStart());
    expect(state).toEqual({
      isLoading: true,
      error: null,
      user: null,
      token: null,
    });
  });

  it("should handle loginSuccess", () => {
    const user = { id: 1, name: "John Doe", email: "john@example.com" };
    const token = "fake-token";

    const state = authReducer(initialState, loginSuccess({ user, token }));

    expect(state).toEqual({
      isLoading: false,
      error: null,
      user,
      token,
    });
  });

  it("should handle loginFailure", () => {
    const error = "Invalid credentials";

    const state = authReducer(initialState, loginFailure(error));

    expect(state).toEqual({
      isLoading: false,
      error,
      user: null,
      token: null,
    });
  });

  it("should handle logout", () => {
    const loggedInState = {
      isLoading: false,
      error: null,
      user: { id: 1, name: "John Doe", email: "john@example.com" },
      token: "fake-token",
    };

    const state = authReducer(loggedInState, logout());

    expect(state).toEqual(initialState);
  });
});
