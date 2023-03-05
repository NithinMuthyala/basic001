const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbpath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());
let db;
const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3010, () => {
      console.log("Server is Running at ......");
    });
  } catch (e) {
    console.log("DB:Error");
  }
};
initialize();

// api1
const hasstatusandpriorityProperty = (requestquery) => {
  return;
  requestquery.priority !== undefined && requestquery.search_q !== undefined;
};
const haspriorityproperty = (requestquery) => {
  return requestquery.priority !== undefined;
};
const hasstatusproperty = (requestquery) => {
  return requestquery.status !== undefined;
};
const hassearchproperty = (requestquery) => {
  return requestquery.search_q !== undefined;
};

app.get("/todos/", async (request, response) => {
  const requestquery = request.query;
  const { status, priority, search_q } = requestquery;
  let dbquery;
  switch (true) {
    case hasstatusandpriorityProperty(requestquery):
      dbquery = `SELECT  * FROM todo 
            WHERE status like "%${status}%" and priority like "${priority}";`;
      break;

    case haspriorityproperty(requestquery):
      dbquery = `SELECT 
                            * 
                            FROM 
                            todo 
                         WHERE priority like "%${priority}%"`;

      break;
    case hasstatusproperty(requestquery):
      dbquery = `SELECT 
                            *
                             FROM 
                             todo 
                     WHERE status like "%${status}%"`;

      break;
    case hassearchproperty(requestquery):
      dbquery = `SELECT 
                            * 
                            FROM 
                            todo 
                     WHERE todo like "%${search_q}%"`;

      break;
  }
  const dbresponse = await db.all(dbquery);
  console.log(dbresponse);
  response.send(dbresponse);
});

// api2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const dbqueryTodo = `SELECT * FROM todo WHERE id = ${todoId}`;
  const dbresponse = await db.get(dbqueryTodo);
  response.send(dbresponse);
});
//api3

app.post("/todos/", async (request, response) => {
  const itemdetails = request.body;
  const { id, todo, priority, status } = itemdetails;
  const dbquery = `INSERT INTO todo 
                            (id,todo,priority,status)
                            VALUES(${id},"${todo}","${priority}","${status}")`;
  const dbresponse = await db.run(dbquery);
  response.send("Todo Successfully Added");
});

//api4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const statusdetails = request.body;

  const getquery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const dbresponse = await db.get(getquery);
  const {
    status = dbresponse.status,
    priority = dbresponse.priority,
    todo = dbresponse.priority,
  } = statusdetails;
  let responsetext;
  switch (true) {
    case statusdetails.status !== undefined:
      responsetext = "Status Updated";
      break;
    case statusdetails.priority !== undefined:
      responsetext = "Priority Updated";
      break;
    case statusdetails.todo !== undefined:
      responsetext = "Todo Updated";
      break;
  }

  const upadtequery = `UPDATE todo  SET todo = "${todo}",
                                    priority ="${priority}",
                                    status = "${status}"
                                    WHERE id = ${todoId};`;
  await db.run(upadtequery);
  response.send(responsetext);
});

// api5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const dbqwery = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(dbqwery);
  response.send("Todo Deleted");
});

module.exports = app;
