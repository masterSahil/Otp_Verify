module.exports.otpVarification = async (otpTime) => {
    try {
        console.log(`Milliseconds is: ${otpTime}`);

        const current_date_time = new Date();
        let differenceValue = (otpTime - current_date_time.getTime()) / 1000;
        differenceValue /= 60;

        const minutes = Math.abs(differenceValue);
        console.log(`Expired minutes: ${minutes}`);

        if (minutes > 1) {
            return true;
        }
        return false;

    } catch (error) {
        console.log(error.message);
    }
}