const axios = require('axios');

module.exports = (async () => {
    var percent = 0;
    await axios.get('https://www.random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain&rnd=new')
        .then((response) => {
            percent = parseInt(response.data, 10);
        })
        .catch((error) => {
            console.error('Error generating random integers:', error.message);
        });

    return percent;
});