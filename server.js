const express=require('express');

require('dotenv').config();

const pool = require('./db');
const send_res = require('./send_res');
const rechain_linkedid = require('./rechain_linkedid');
const app= express();
app.use(express.json()); 

app.get('/',async (req,res)=>{
    try {
        const result = await pool.query('SELECT * FROM customers;');
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
       // const currentlyAdded =await pool.query(`INSERT INTO customers(email,phoneNumber) VALUES($1,$2)`,[email, phoneNumber]);
       // const currentlyAddedId=currentlyAdded.rowCount();
        const result = await pool.query(`SELECT * FROM customers WHERE email = $1 AND phoneNumber = $2`,[email, phoneNumber]);

        if(result.rowCount ==0){
            const result2 = await pool.query(`SELECT * FROM customers WHERE email = $1 OR phoneNumber = $2`,[email, phoneNumber]);

            if(result2.rowCount==0){
                //both email and phone number doesnt exist
                console.log("hiii\n");
                const currentlyAdded =await pool.query(`INSERT INTO customers(email,phoneNumber) VALUES($1,$2)`,[email, phoneNumber]);
                const row_size=await pool.query(`select count(*) from customers`);
                console.log(row_size);
                const new_userId=Number(row_size.rows[0].count)+1;
                console.log("hii22",new_userId);
                await pool.query(`INSERT INTO users(user_id) values($1);`,[new_userId]);
                console.log("1");
            }
            else{
                console.log("joining two users");
                const email_min=await pool.query(`select min(id) from customers where email=$1`,[email]);
                const email_min_id=email_min.rows[0].min;
                const phoneNumber_min=await pool.query(`select min(id) from customers where phoneNumber=$1`,[phoneNumber]);
                const phoneNumber_min_id=phoneNumber_min.rows[0].min;
                console.log(phoneNumber_min_id);

                if((phoneNumber_min_id!=null) && (email_min_id!=null)){
                    //
                    let user;
                    let sup_user;
                    if((email_min_id < phoneNumber_min_id)){
                        user=await pool.query(`select user_id from users where id=$1 `,[phoneNumber_min_id]);
                        sup_user=await pool.query(`select user_id from users where id=$1 `,[email_min_id]);
                        await pool.query(`UPDATE customers SET linkprecedence=$1 where id=$2`,['secondary',phoneNumber_min_id]);
                    }
                    else{
                        user=await pool.query(`select user_id from users where id=$1 `,[email_min_id]);
                        sup_user=await pool.query(`select user_id from users where id=$1 `,[phoneNumber_min_id]);
                        await pool.query(`UPDATE customers SET linkprecedence=$1 where id=$2`,['secondary',email_min_id]);
                    }
                    console.log("got the user ",user);
                    const sup_user_id=(sup_user.rows)[0].user_id;
                    const user_id=(user.rows)[0].user_id;
                    console.log(user_id,sup_user_id);
                    await pool.query(`UPDATE customers SET updatedat=now() WHERE customers.id in (select id from users where user_id=$1)`,[user_id]);
                    await pool.query(`UPDATE users SET user_id=$1 WHERE user_id=$2;`,[sup_user_id,user_id]);

                    await pool.query(`INSERT INTO customers(email,phoneNumber,linkprecedence) VALUES($1,$2,$3)`,[email, phoneNumber,'secondary']);
                    await pool.query(`INSERT INTO users(user_id) values($1);`,[sup_user_id]);

                }
                else{
                    if(phoneNumber_min_id==null){
                        let user=await pool.query(`select user_id from users where id=$1 `,[email_min_id]);
                        const user_id=(user.rows)[0].user_id;
                        await pool.query(`INSERT INTO customers(email,phoneNumber,linkprecedence) VALUES($1,$2,$3)`,[email, phoneNumber,'secondary']);
                        await pool.query(`INSERT INTO users(user_id) values($1);`,[user_id]);
                    }
                    else{
                        let user=await pool.query(`select user_id from users where id=$1 `,[phoneNumber_min_id]);
                        const user_id=(user.rows)[0].user_id;
                        await pool.query(`INSERT INTO customers(email,phoneNumber,linkprecedence) VALUES($1,$2.$3)`,[email, phoneNumber,'secondary']);
                        await pool.query(`INSERT INTO users(user_id) values($1);`,[user_id]);
                    }
                }
            }

            const result3 = await pool.query(`SELECT * FROM customers WHERE email = $1 AND phoneNumber = $2;`,[email, phoneNumber]);
            console.log("2");
            console.log(email,phoneNumber);
            console.log(result3);
            const answer=await send_res(result3);
             console.log("3");
            console.log("ok",answer);
            rechain_linkedid();
            res.status(200).json(answer);

        }
        else{
            //user with same email and phone number exist
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





*/








