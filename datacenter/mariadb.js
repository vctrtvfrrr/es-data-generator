import mariadb from "mariadb";
import moment from "moment";

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "secret",
  database: "elasticsearch",
});

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
        const date = moment(columns[k]).format("YYYY-MM-DD HH:MM:SS");
        values.push(`'${date}'`);
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
