const emailvalidation = async (req, res) => {
    let { name, email, password } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    if (name === "" || password === "" || email === "") {
        res.json({
            status: "FAILED",
            message: "Empty input fields!"
        });
    } else if (!/^[a-zA-Z]*$/.test(name)) {
        res.json({
            status: "Failed",
            massage: "Invalid name entered",
        });
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "Failed",
            message: "Invalid email entered",
        });
    } else if (password.length < 4) {
        res.json({
            status: "Failed",
            message: "Password is too short"
        });
    }
};

module.exports = emailvalidation;