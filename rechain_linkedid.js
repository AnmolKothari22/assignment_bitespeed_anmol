const pool = require('./db');


async function rechain_linkedid(){
    console.log("rechaining linkedids..");
    await pool.query(`UPDATE customers t1
                    SET linkedid = sub.prev_linkedid
                    FROM (
                        SELECT t1.id,
                            LAG(t1.id) OVER (
                                PARTITION BY t2.user_id
                                ORDER BY t1.id
                            ) AS prev_linkedid
                        FROM customers t1
                    JOIN users t2 ON t1.id = t2.id
                    ) sub
                    WHERE t1.id = sub.id;
    `);

}


module.exports=rechain_linkedid;

