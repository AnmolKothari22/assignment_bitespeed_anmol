const express=require('express');

require('dotenv').config();

const pool = require('./db');
const send_res = require('./send_res');
const app= express();
app.use(express.json()); 

app.get('/',async (req,res)=>{
    try {
        const result = await pool.query('SELECT * FROM tester;');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


app.post('/identify',async (req,res)=>{
    try{

        email=req.body.email;
        phoneNumber=req.body.phoneNumber;
       // const currentlyAdded =await pool.query(`INSERT INTO tester(email,phoneNumber) VALUES($1,$2)`,[email, phoneNumber]);
       // const currentlyAddedId=currentlyAdded.rowCount();
        const result = await pool.query(`SELECT * FROM tester WHERE email = $1 AND phoneNumber = $2`,[email, phoneNumber]);

        if(result.rowCount ==0){
            const result2 = await pool.query(`SELECT * FROM tester WHERE email = $1 OR phoneNumber = $2`,[email, phoneNumber]);

            if(result2.rowCount==0){
                const currentlyAdded =await pool.query(`INSERT INTO tester(email,phoneNumber) VALUES($1,$2)`,[email, phoneNumber]);
                const row_size=await pool.query(`select count(*) from tester`);
                const new_userId=(row_size.rows)[0]+1;
                await pool.query(`INSERT INTO user_tester(user_id) values($1);`,[ new_userId]);
            }
            else{
                //joining two users
                const email_min=await pool.query(`select min(id) from tester where email=$1`,[email]);
                const email_min_id=email_min.rows[0].min;
                const phoneNumber_min=await pool.query(`select min(id) from tester where phoneNumber=$1`,[phoneNumber]);
                const phoneNumber_min_id=phoneNumber_min.rows[0].min;
               // console.log(phoneNumber_min_id);
                let user;
                let sup_user;
                if(email_min_id < phoneNumber_min_id){
                    user=await pool.query(`select user_id from user_tester where id=$1 `,[phoneNumber_min_id]);
                    sup_user=await pool.query(`select user_id from user_tester where id=$1 `,[email_min_id]);
                }
                else{
                    user=await pool.query(`select user_id from user_tester where id=$1 `,[email_min_id]);
                    sup_user=await pool.query(`select user_id from user_tester where id=$1 `,[phoneNumber_min_id]);
                }
                console.log(user);
                const sup_user_id=(sup_user.rows)[0].user_id;
                const user_id=(user.rows)[0].user_id;
                console.log(user_id,sup_user_id);
                await pool.query(`UPDATE user_tester SET user_id=$1 WHERE user_id=$2;`,[sup_user_id,user_id]);
                await pool.query(`INSERT INTO tester(email,phoneNumber) VALUES($1,$2)`,[email, phoneNumber]);
                await pool.query(`INSERT INTO user_tester(user_id) values($1);`,[sup_user_id]);
            }

            const result3 = await pool.query(`SELECT * FROM tester WHERE email = $1 AND phoneNumber = $2;`,[email, phoneNumber]);
            console.log(email,phoneNumber);
            console.log(result3);
            const answer=await send_res(result3);
            console.log("ok",answer);
            res.status(200).json(answer);
        }
        else{
          const answer=await send_res(result);
          console.log("ok",answer);
          res.status(200).json(answer);
        }

    }
    catch(err){
         console.error(err);
        res.status(500).send('Server error');
    }

});


app.listen(process.env.APP_PORT,()=>{
    console.log("server started at port",process.env.APP_PORT);
});









/*


contacts me nodes--> id,phone,email,linkedid,linkprecedance,created,updated,deleted


n1=e1,p1

if(e1 && p1){
    if(dono ek hii node ke hai){
        uski linked list return karo
    }
    else{
        dono diff person hai abhi , too first merge
        jiska primary contact ka smallest creation time hoo vo primary rahega
        **LINEARITY maintain karne ke liye merge karo 
        phir uski linked list return karo
    }
    
}
else if(e1){
    //secondary banega
    {contact mai dallo
    largest id node jiska email same hoo vo iska papa
    cte se sab mail, phone number and id lelo
    topmost(ref null hoga) usko specially handle karo kyuki voo first element hoga arrays mai}=jj

}
else if(p1){
    //secondary banega
    {jj}
}
else{
    //primary banega
    contact mai new data n1

}



//approach 2


customer table (id,email,phone,update time)
1
2
3
4
5
6

user table (id,)
1 u1
2 u2
3 u1
4 u2
5 u1
6 u1

bottom table

u1 6
u2 4

curl -X POST http://localhost:3000/identify \ -H "Content-Type: application/json" \ -d '{"email":"happy@gmail","phoneNumber":"1234"}'




*/








