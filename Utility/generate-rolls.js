const axios = require('axios');

module.exports = (async (rollCount) => {
    let numbers = []
    try {
        await axios.get(`https://www.random.org/integers/?num=${rollCount}&min=1&max=10&col=1&base=10&format=plain&rnd=new`)
            .then((response) => {
                if (rollCount > 1) {
                    const numbersTemp = response.data.split('\n').map(Number);
        
                    if (numbersTemp.length === rollCount) {
                        for (let index = 0; index < numbersTemp.length; index++) {
                            const element = numbersTemp[index];
                            
                            numbers[index] = parseInt(element, 10);
                        }
                    } else if (numbersTemp.length - 1 === rollCount) {
                        for (let index = 0; index < numbersTemp.length - 1; index++) {
                            const element = numbersTemp[index];
                            
                            numbers[index] = parseInt(element, 10);
                        }
                    } else {
                        throw new Error('Unexpected number of random integers received');
                    }
                } else {
                    numbers[0] = parseInt(response.data, 10);
                }
            })
            .catch((error) => {
                throw new Error(error);
            });
    
        return numbers;
    } catch (error) {
        console.error('Error generating dice rolls: ' + error);
    }
});