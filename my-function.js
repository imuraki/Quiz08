console.log('Loading function');

exports.handler = async (event, context) => {
    
   const params = event["queryStringParameters"]["keyword"];
   
   const res = {
       statusCode: 200,
       body: JSON.stringify("Akhil says " + params)
   };
   
   return res;
};
