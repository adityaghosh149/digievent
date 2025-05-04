const generateAccessAndRefreshTokens = async (user) => {
    try {
        // const user = await user.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {
            accessToken,
            refreshToken,
        };
    } catch (error) {
        throw new APIError(
            500,
            "Something went wrong while generating access and refresh token"
        );
    }
};

export { generateAccessAndRefreshTokens };

