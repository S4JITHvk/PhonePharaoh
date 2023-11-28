const generateOTP = async () => {
    try {
        const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
        return otp;
    } catch (err) {
        throw err;
    }
  };
  module.exports = generateOTP;