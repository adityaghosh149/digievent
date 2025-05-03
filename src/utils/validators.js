const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isStrongPassword = (password) => {
    // Min 8 chars, at least 1 lowercase, 1 uppercase, 1 number, and 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    return passwordRegex.test(password);
};

function isValidIndianPhoneNumber(phoneNumber) {
    const indianPhoneNumberRegex = /^[6-9]\d{9}$/;
    return indianPhoneNumberRegex.test(phoneNumber);
}

export { isStrongPassword, isValidEmail, isValidIndianPhoneNumber };

