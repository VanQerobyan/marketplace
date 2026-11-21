export type SignIn = {
    username: string, 
    password: string
}

export type SignUp = {
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string
}

export type SignUpResponse = {
    id: number,
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    avatar: null | string,
    hasPassword?: boolean,
    updatedAt: string,
    createdAt: string
}

export type SignInResponse = {
    user: SignUpResponse,
    token: string,
    refreshToken: string
}

export type SuccessSignUpResponse<T> = {
    success: boolean,
    data: {  
        user: T
    },
}
export type SuccessSignInResponse = {
    success: boolean,
    data: SignInResponse
}


export type ChangePasswordType = {
    currentPassword: string,
    newPassword: string
}

export type SuccessRefreshToken = {
    success: boolean,
    data: {
        token: string
    }
}
