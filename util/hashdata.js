const bcrypt = require('bcrypt')

const hashData=async  (data,saltRound=10)=>{
    try{
        const hashedData = await bcrypt.hash(data, saltRound)
        return hashedData
    }catch(error){
        throw Error
    }
}
const verifyHashedData = async (unhashed,hashed) => {
    try {
        const match = await bcrypt.compare(unhashed,hashed);
        return match;

    } catch (error) {
        
    }
}

module.exports={hashData,
        verifyHashedData
    }