
module.exports = async (req, res) => {

    const data = { clientId: process.env.BOT_ID, clientSecret: process.env.BOT_SECRET }
    console.log(data);
    setTimeout(() => {
        res.send(data);
    }, 1000)
}