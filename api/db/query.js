import pg from 'pg';
import url from 'url';
var types = pg.types;
types.setTypeParser(1114, function(stringValue) {
    return new Date(stringValue + "+0000");
});
require('dotenv').config();
const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(':');
const pgConfig = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl: process.env.PG_SSL.toLowerCase() === 'true',
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};
const pool = new pg.Pool(pgConfig);

export function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return input;
    }

    const regex = new RegExp(/[\0\x08\x09\x1a\n\r"'\\\%]/g);
    const escaper = function escaper(char) {
        const inChar = ['\0', '\x08', '\x09', '\x1a', '\n', '\r', "'", '"', '\\', '%'];
        const outChar = ['\\0', '\\b', '\\t', '\\z', '\\n', '\\r', "''", '\\"', '\\\\', '\\%'];
        const inIndex = inChar.indexOf(char);
        return outChar[inIndex];
    };

    const result = input.replace(regex, escaper);
    return result;
}

export function javascriptValueToSQLString(value) {
    if (typeof value === 'string') {
        return "'" + value + "'";
    } else if (value instanceof Date) {
        return "'" + value.toISOString() + "'";
    } else if (typeof value === 'undefined') {
        return 'NULL';
    } else if (value === null) {
        return 'NULL';
    }
    return value;
}

export function sanitizeAndSQLize(javascriptValue) {
    return javascriptValueToSQLString(sanitizeInput(javascriptValue));
}

function dirtyOutput(output) {
    if (typeof output !== 'string') {
        return output;
    }

    const regex = new RegExp(/\\[0btznr"\\%]/g);
    const escaper = function escaper(char) {
        const inChar = ['\\0', '\\b', '\\t', '\\z', '\\n', '\\r', '\\"', '\\\\', '\\%'];
        const outChar = ['\0', '\x08', '\x09', '\x1a', '\n', '\r', '"', '\\', '%'];
        const inIndex = inChar.indexOf(char);
        return outChar[inIndex];
    };

    const result = output.replace(regex, escaper);
    return result;
}

function dirtyRows(rows) {
    return rows.map((row) => {
        if (typeof row === 'object') {
            const result = {};
            for (const key in row) {
                if (row.hasOwnProperty(key)) {
                    result[key] = dirtyOutput(row[key]);
                }
            }
            return result;
        }
        return dirtyOutput(row);
    });
}

export function executeQuery(queryString, callback) {
    pool.connect((connectionError, client, done) => {
        if (connectionError) {
            callback(undefined, connectionError);
        } else {
            client.query(queryString, (queryError, result) => {
                done();
                if (queryError) {
                    callback(undefined, queryError);
                } else {
                    callback(dirtyRows(result.rows), undefined);
                }
            });
        }
    });
}

pool.on('error', function (err, client) {
    // if an error is encountered by a client while it sits idle in the pool
    // the pool itself will emit an error event with both the error and
    // the client which emitted the original error
    // this is a rare occurrence but can happen if there is a network partition
    // between your application and the database, the database restarts, etc.
    // and so you might want to handle it and at least log it out
    console.error('idle client error', err.message, err.stack, JSON.stringify(err));
});
