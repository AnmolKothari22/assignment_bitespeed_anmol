const pool = require('./db');


async function send_res(result){
   // console.log(result.rows);
const ro=await pool.query(`SELECT user_Id from user_tester where id=$1 `,[(result.rows)[0].id]);
//console.log(ro.rows);
const userId=ro.rows[0].user_id;
const ans=await pool.query(`SELECT * from tester where tester.id in (select id from user_tester where user_id=$1);`,[userId]);
const answer=ans.rows;
let email_array=[];
let phoneNumber_array=[];
let secondaryContactIds_array=[];
let primaryContatctId=0;
//console.log(answer);
for (let i = 0; i < answer.length; i++) {
    if(i!=0){
        secondaryContactIds_array.push(answer[i].id);
    }
    else{
        primaryContatctId=answer[i].id;
    }
    email_array.push(answer[i].email);
    console.log(answer[i]);
    phoneNumber_array.push(answer[i].phonenumber);
}
return {contact:{primaryContatctId,phoneNumbers:phoneNumber_array,emails:email_array,secondaryContactIds:secondaryContactIds_array}};
}

module.exports=send_res;

