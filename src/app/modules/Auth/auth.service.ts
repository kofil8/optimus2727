import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiErrors';
import emailSender from '../../../helpars/emailSender';
import { jwtHelpers } from '../../../helpars/jwtHelpers';
import prisma from '../../../shared/prisma';

const login = async (payload: { email: string; password: string }) => {
  // Find the user using either email or username
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Ensure a password is provided and exists in the user record
  if (!payload.password || !userData?.password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required');
  }

  // Verify the password
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'credentials are not matched');
  }

  // Generate JWT token
  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );
  return { accessToken };
};

const getMyProfile = async (id: string) => {
  const userProfile = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!userProfile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return userProfile;
};

// change password
const changePassword = async (
  userToken: string,
  newPassword: string,
  oldPassword: string
) => {
  // console.log(userToken, newPassword, oldPassword);
  const decodedToken = jwtHelpers.verifyToken(
    userToken,
    config.jwt.jwt_secret!
  );

  const user = await prisma.user.findUnique({
    where: { id: decodedToken?.id },
  });

  if (!user || !user?.password) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user?.password);

  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect crendentials');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: decodedToken.id,
    },
    data: {
      password: hashedPassword,
    },
  });
  return { message: 'Password changed successfully' };
};

// forgot password
const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const resetPassToken = jwtHelpers.generateToken(
    { email: userData.email, role: userData.role },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_token_expires_in as string
  );

  const resetPassLink =
    config.reset_pass_link + `?userId=${userData.id}&token=${resetPassToken}`;

  await emailSender(
    'Reset Your Password',
    userData.email,
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 20px; line-height: 1.6; color: #333333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #FF7600; padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Password Reset Request</h1>
        </div>
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear User,</p>

            <p style="font-size: 16px; margin-bottom: 30px;">We received a request to reset your password. Click the button below to reset your password:</p>

            <div style="text-align: center; margin-bottom: 30px;">
                <a href=${resetPassLink} style="display: inline-block; background-color: #FF7600; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: 600; transition: background-color 0.3s ease;">
                    Reset Password
                </a>
            </div>

            <p style="font-size: 16px; margin-bottom: 20px;">If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>

            <p style="font-size: 16px; margin-bottom: 0;">Best regards,<br>Office Alarm Support Team</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d;">
            <p style="margin: 0 0 10px;">This is an automated message, please do not reply to this email.</p>
            <p style="margin: 0;">© 2025 Office Alarm. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`
  );
  return {
    message: 'Reset password link sent via your email successfully',
    resetPassLink,
  };
};

// reset password
const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  // console.log(token)
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  let isValidToken;
  try {
    isValidToken = jwtHelpers.verifyToken(
      token,
      config.jwt.reset_pass_secret as Secret
    );
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid token signature');
  }

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden!');
  }

  const password = await bcrypt.hash(payload.password, 12);

  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password,
    },
  });
  return { message: 'Password reset successfully' };
};

// logout
const logoutUser = async (userId: string) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isOnline: false,
    },
  });
  return;
};

export const AuthServices = {
  login,
  logoutUser,
  getMyProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
