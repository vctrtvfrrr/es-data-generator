import mariadb from "mariadb";

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "secret",
  database: "elasticsearch",
});

function formatDate(date) {
  if (typeof date !== "object") date = new Date(date);

  let month = "" + (date.getMonth() + 1);
  let day = "" + date.getDate();
  let year = "" + date.getFullYear();
  let hours = "" + date.getHours();
  let minutes = "" + date.getMinutes();
  let seconds = "" + date.getSeconds();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  if (hours.length < 2) hours = "0" + hours;
  if (minutes.length < 2) minutes = "0" + minutes;
  if (seconds.length < 2) seconds = "0" + seconds;

  const Ymd = [year, month, day].join("-");
  const Hms = [hours, minutes, seconds].join(":");

  return `${Ymd} ${Hms}`;
}

async function runQuery(query) {
  let conn;

  try {
    conn = await pool.getConnection();
    const res = await conn.query(query);
    console.log(res);
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.end();
  }
}

async function createSchema(table, columns) {
  const sql = [];

  sql.push(`CREATE TABLE IF NOT EXISTS \`${table}\` (`);

  const fields = [];
  Object.keys(columns).forEach((k) => {
    if (k === "id") {
      fields.push("\t`id` INT AUTO_INCREMENT PRIMARY KEY");
      return;
    }
    if (k === "created_at" || k.endsWith("_date")) {
      fields.push(`\t\`${k}\` TIMESTAMP NULL DEFAULT NULL`);
      return;
    } else if (typeof columns[k] === "object") {
      fields.push(`\t\`${k}\` LONGTEXT NOT NULL DEFAULT ''`);
      return;
    }
    fields.push(`\t\`${k}\` VARCHAR(255) NOT NULL`);
  });
  sql.push(fields.join(",\n"));

  sql.push(")  ENGINE=INNODB;");

  await runQuery(sql.join("\n"));
}

async function doInsert(table, columns) {
  const sql = [];

  sql.push(`INSERT INTO \`${table}\` (`);

  const fields = [];
  const values = [];
  Object.keys(columns).forEach((k) => {
    fields.push(`\`${k}\``);

    if (k === "created_at" || k.endsWith("_date")) {
      if (columns[k] !== null) {
        values.push(`'${formatDate(columns[k])}'`);
      }
    } else if (typeof columns[k] === "object") {
      values.push(`'${JSON.stringify(columns[k])}'`);
    } else {
      values.push(`'${columns[k]}'`);
    }
  });

  sql.push(fields.join(","));
  sql.push(") VALUES (");
  sql.push(values.join(","));
  sql.push(");");

  await runQuery(sql.join("\n"));
}

export default {
  async save(payload) {
    await createSchema(payload.index, payload.body);
    await doInsert(payload.index, payload.body);
  },
};
