module.exports = (async (percentage) => {

    if (percentage == 100) {
        return [0, 0]
    }

    let integer1 = Math.floor(percentage * 0.1);
    let integer2 = percentage - integer1 * 10;

    const numbers = [integer1, integer2];

    return numbers;
});